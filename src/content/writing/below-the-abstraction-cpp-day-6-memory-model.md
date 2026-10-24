---
title: "C++ Day 6: Happens-Before and the Memory Model"
description: "A practical introduction to data races, atomics, sequential consistency, acquire-release ordering, and what the C++ memory model actually guarantees."
publishedAt: 2026-04-28
slug: "cpp-day-6-memory-model"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

In one thread, the order in which expressions are evaluated is constrained by the language. Across threads, source-code order alone does not establish a communication protocol. The C++ memory model gives us the vocabulary to say which actions are ordered, which values another thread may observe, and when a program has no defined behavior at all.

The important starting point is not “the CPU might reorder this.” It is: **what relationship does the C++ program establish between these accesses?** The compiler and processor must implement the guarantees the program requests, but hardware details do not replace those language rules.

## A flag does not make ordinary data safe

This example looks like a message-passing protocol:

```cpp
int data = 0;
bool ready = false;

// Producer thread
data = 42;
ready = true;

// Consumer thread
while (!ready) {
}
std::cout << data << '\n';
```

But both threads access `ready`, and one writes it while another reads it, with no synchronization. They also access `data` from separate threads, with a write and a read that are not ordered. These are data races on non-atomic objects. In C++, a data race causes **undefined behavior**; the language does not promise that the consumer eventually sees `true` or prints `42`.

It is tempting to explain the failure only by saying that the compiler or CPU could make the flag visible before the data. Those are useful implementation-level intuitions, but they are not the core diagnosis. Once a program has a data race, reasoning from the apparent order of ordinary loads and stores is not valid. Cache coherence does not turn unsynchronized plain accesses into a correct protocol.

## Sequenced-before, synchronizes-with, happens-before

The memory model builds cross-thread ordering from relationships:

- **Sequenced-before** orders evaluations within a single thread as specified by the language.
- **Synchronizes-with** can connect operations in different threads when the required synchronization conditions are met—for example, a release store and an acquire load that reads from that store or its release sequence.
- **Happens-before** includes these relationships and their transitive consequences.

If a write happens-before a read of the same non-atomic object, the read is ordered after that write. This is how a program can safely publish ordinary data using an atomic synchronization variable:

```cpp
#include <atomic>
#include <iostream>
#include <thread>

int data = 0;
std::atomic<bool> ready{false};

void producer() {
    data = 42;
    ready.store(true, std::memory_order_release);
}

void consumer() {
    while (!ready.load(std::memory_order_acquire)) {
    }
    std::cout << data << '\n';
}
```

When the acquire load reads the `true` published by the release store, the store synchronizes with that load. The ordering chain is:

```text
data = 42
    sequenced-before
release store to ready
    synchronizes-with
acquire load that reads true
    sequenced-before
read data
```

By transitivity, the write to `data` happens-before the read. `data` itself can remain non-atomic because access is ordered and the producer does not modify it again while the consumer reads it. The atomic flag is the synchronization channel; it does not make arbitrary concurrent accesses safe by itself.

The program also needs a lifecycle rule: the producer must publish only after finishing the data, and must not mutate that data concurrently with the consumer. In real code, thread creation, joining, and object lifetime must also be handled correctly.

## Sequential consistency: the easiest order to reason about

`std::memory_order_seq_cst` is the default order for atomic operations that accept a memory-order argument. Sequentially consistent operations provide acquire/release effects where applicable and participate in a single total order that is consistent with the relevant per-thread ordering constraints.

That total order makes classic “both threads miss the other's update” cases easier to reason about. Consider the core of Dekker's two-flag example:

```cpp
std::atomic<bool> wants_a{false};
std::atomic<bool> wants_b{false};

// Thread A
wants_a.store(true); // seq_cst by default
bool b_is_waiting = wants_b.load();

// Thread B
wants_b.store(true); // seq_cst by default
bool a_is_waiting = wants_a.load();
```

With all four operations sequentially consistent, both loads cannot read the initial `false`. If they did, the global order would have to put each load before the other thread's store, while each thread's own store is ordered before its load—a cycle, which a total order cannot contain.

If the stores remain sequentially consistent but the loads are relaxed, both loads may read `false`. Relaxed loads are not required to participate in the sequentially consistent total order. Memory order is chosen per operation, not attached permanently to an atomic variable.

This is a reasoning illustration, not a recommended lock implementation. Real mutual exclusion should generally use a mutex or a well-reviewed synchronization primitive.

Sequential consistency may require stronger constraints than weaker orders, but its cost is not a fixed instruction count. On x86-64, ordinary acquire loads and release stores often compile to ordinary loads and stores because the architecture already provides the required ordering for those operations. Sequentially consistent stores, read-modify-write operations, and other cases may need stronger instructions or fences. On ARM and other architectures, acquire/release instructions or barriers may be used. Compilers select an implementation based on the operation, target, and surrounding code; C++ memory orders are semantic guarantees, not direct names for particular hardware fences.

## Acquire and release: publish in one direction

Acquire and release are designed to establish a one-way communication edge:

- A **release** operation prevents earlier operations in that thread from being moved after the publication point in a way that would violate the language guarantee.
- An **acquire** operation prevents later operations in that thread from being moved before the point where the published value is observed.

If an acquire operation reads from a release operation (or its release sequence), the release synchronizes-with the acquire. This orders the work before publication with the work after observation. If the acquire reads some unrelated value, that particular synchronizes-with relationship is not established.

For example, an atomic flag can publish a completed result:

```cpp
result = compute();
published.store(true, std::memory_order_release);

// Another thread:
if (published.load(std::memory_order_acquire)) {
    use(result);
}
```

The acquire-release pair does not create one global order for every operation in the program. It creates the ordering needed along this communication path. Those orders can chain transitively through additional synchronized operations, allowing publication to pass through a coordinating thread.

`memory_order_relaxed` is weaker: it still gives atomicity and a per-object modification order for that atomic, but it does not by itself publish surrounding non-atomic data or establish a happens-before edge. Use it when the algorithm needs only atomic access to that value and its correctness does not depend on ordering other operations. “Relaxed” does not mean the atomic can tear or that every rule disappears.

## Atomic objects and data races

An atomic operation is indivisible with respect to other operations on that atomic object, and atomic operations have defined ordering rules. `std::atomic<T>` objects are not copied as ordinary values; their copy constructor and copy assignment are deleted. Instead, load the contained value and use it to initialize or update another atomic explicitly.

Not every `std::atomic<T>` is guaranteed to be lock-free. Implementations can use locks for some types or platforms. `is_lock_free()` (and, where useful, `is_always_lock_free`) can answer whether the implementation provides lock-free operations for a type or object, but “lock-free” is not a guarantee of low latency or good performance.

`std::atomic_flag` is the standard's guaranteed lock-free atomic flag. It can be used to demonstrate a spin lock:

```cpp
#include <atomic>

class spin_mutex {
    std::atomic_flag locked = ATOMIC_FLAG_INIT;

public:
    void lock() {
        while (locked.test_and_set(std::memory_order_acquire)) {
        }
    }

    void unlock() {
        locked.clear(std::memory_order_release);
    }
};
```

The acquire on successful lock acquisition and release on unlock protect the critical section. A spin lock continuously consumes CPU while waiting, so it is not automatically better than `std::mutex`; it is appropriate only when its constraints and measured behavior make sense. C++20 also added a non-modifying `test()` operation to `atomic_flag`.

Atomic operations prevent a data race on the atomic object, but they do not automatically make a multi-step algorithm correct. If several atomic operations need to act as one conditional update, use a read-modify-write operation such as `exchange` or compare-and-exchange.

## Compare-and-exchange in retry loops

Compare-and-exchange (CAS) compares an atomic's current value with `expected`. If they match, it stores the desired value. If they do not, it updates `expected` with the observed value and reports failure:

```cpp
std::atomic<int> value{0};
int expected = value.load();

while (!value.compare_exchange_weak(expected, expected + 1)) {
    // On failure, expected has been refreshed; recompute if needed.
}
```

`compare_exchange_weak` may fail spuriously, even when the values compare equal, so it is commonly used in a retry loop. `compare_exchange_strong` rules out that kind of spurious failure, making it useful when a single attempt needs a definitive result. Both forms can fail because another thread changed the value; the caller must handle that case too.

The failure order applies to the load performed by a failed CAS and cannot be `release` or `acq_rel`, because failure does not store a new value. With the default overloads, success and failure use sequential consistency; when specifying orders explicitly, choose a valid pair for the algorithm rather than mechanically weakening them.

## A note on `memory_order_consume`

Consume ordering was designed for cases where later operations depend on a value loaded from an atomic—for example, loading a pointer and then dereferencing it. The intended guarantee is narrower than acquire ordering, but compiler support and dependency tracking have proved difficult to use reliably. In practice, mainstream implementations have commonly treated consume loads as acquire loads, so code rarely receives the hoped-for performance benefit. Prefer acquire unless you have a specific, well-supported reason and have verified the implementation behavior you need.

## What “fences” mean below the abstraction

The C++ standard specifies observable relationships between operations; it does not require a particular CPU instruction or cache protocol. A compiler may constrain code motion, emit an acquire/release instruction, insert a hardware fence, or use an operation whose architecture already provides the needed ordering. The mapping depends on the target and the surrounding code.

That is why it is better to design from the happens-before graph first, then inspect generated assembly and benchmark only if performance requires it. Replacing an order with a weaker one because a platform “usually does this” risks making the program incorrect on another target—or after a compiler change.

## The mental model

Use ordinary objects for data that is protected by a clear happens-before relationship. Use atomics for values that really are communicated or modified concurrently. Start with sequential consistency when you need the simplest reasoning; move to acquire/release or relaxed operations only when the algorithm is understood and the weaker guarantee is sufficient.

The memory model is not a catalog of mysterious CPU reorderings. It is the contract that lets a C++ program communicate across threads without relying on timing, cache luck, or a single processor's implementation details.
