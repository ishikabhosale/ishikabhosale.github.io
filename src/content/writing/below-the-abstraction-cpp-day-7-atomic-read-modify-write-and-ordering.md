---
title: "C++ Day 7: Atomic Updates and Ordering"
description: "A hands-on look at fetch_add, compare-and-exchange loops, sequential consistency, and choosing synchronization primitives."
publishedAt: 2026-05-05
slug: "cpp-day-7-atomic-read-modify-write-and-ordering"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

Day six introduced the C++ memory model: data races, happens-before, and the ordering guarantees that let threads communicate safely. Today I’m looking more closely at the operations that update an atomic value and at the design choice behind every concurrent algorithm: how much ordering does it actually need?

The short version is reassuring: start with standard synchronization tools and the default memory order. Make the algorithm correct first. Weaken ordering or reach for fences only when you can explain the required guarantee and have evidence that the change matters.

## Atomic read-modify-write operations

An atomic read-modify-write operation both observes and updates an atomic object as one indivisible operation. `fetch_add`, for example, adds to the value and returns the value from before the addition:

```cpp
std::atomic<int> counter{0};

int old_value = counter.fetch_add(5, std::memory_order_relaxed);
// old_value is 0; counter is now 5
```

If another thread updates `counter` at the same time, the operations still appear in a single modification order for that atomic. No other atomic operation can slip between the read and the update as though they were two separate steps.

The integral atomic specializations provide related operations, including `fetch_sub`, `fetch_and`, `fetch_or`, and `fetch_xor`. Compound assignment such as `counter += 5` is also an atomic read-modify-write operation for integral atomics, though it does not return the previous value like `fetch_add` does.

`memory_order_relaxed` is appropriate here if the counter is only a counter and does not publish or protect other data. The update remains atomic, but it does not establish ordering for unrelated objects.

## Compare-and-exchange: update only if the value is still expected

Compare-and-exchange, often called CAS, is a conditional atomic update. In simplified terms:

```text
if the atomic's current value equals expected:
    store desired and report success
otherwise:
    write the observed current value into expected and report failure
```

The comparison and possible update happen atomically. The `expected` argument is passed by reference so a failed attempt can return the value that was actually observed.

CAS is useful when the next value depends on the current one. Here is a loop that atomically raises a shared maximum:

```cpp
std::atomic<int> shared_max{0};

void try_update(int candidate) {
    int current = shared_max.load(std::memory_order_relaxed);

    while (candidate > current) {
        if (shared_max.compare_exchange_weak(
                current,
                candidate,
                std::memory_order_relaxed,
                std::memory_order_relaxed)) {
            return;
        }
        // On failure, current has been updated with the observed value.
    }
}
```

Suppose two threads read `5`; one wants to publish `7`, and the other wants `10`. If `7` wins first, the attempt to replace `5` with `10` fails and updates the losing thread's `current` to `7`. Since `10 > 7`, that thread retries and can then publish `10`. If the observed value already meets or exceeds the candidate, the loop exits without writing.

The relaxed order is sufficient for this example because the atomic integer communicates only the maximum value. If the value were also a signal that other data was ready, the algorithm would need an appropriate synchronization relationship, such as release and acquire operations.

## Weak versus strong CAS

`compare_exchange_weak` is allowed to fail spuriously: it may report failure even when the value matched `expected`. This can occur naturally on architectures that implement CAS using load-linked/store-conditional sequences, where the conditional store may fail for reasons beyond a changed value. The exact implementation behavior varies by target.

`compare_exchange_strong` rules out spurious failure at the C++ interface: if the value matches and the operation can complete, it does not report a mismatch merely because of a spurious failure. It can still fail because another thread changed the value.

That leads to a useful guideline, not an absolute law:

- In a loop that already retries after failure, `weak` is often a good fit; the loop naturally handles spurious failures.
- For a single attempt where a false negative would change the caller's decision, `strong` may be simpler.

On some targets, weak and strong may compile to the same instruction. On others, a strong operation may use a retry sequence to hide spurious failures. Neither form is universally faster, and ARM is not the only architecture where implementation details matter. Choose based on the algorithm first, then inspect and measure on the targets you support.

## Sequential consistency and the simple mental model

Sequentially consistent (SC) atomic operations participate in a single total order that respects the required per-thread ordering. This makes many concurrent executions easier to reason about, because threads can be understood as observing one globally consistent sequence of SC operations.

Consider two threads that each announce intent and then inspect the other thread's flag:

```cpp
std::atomic<bool> flag_a{false};
std::atomic<bool> flag_b{false};

// Thread A
flag_a.store(true); // sequentially consistent by default
bool saw_b = flag_b.load();

// Thread B
flag_b.store(true); // sequentially consistent by default
bool saw_a = flag_a.load();
```

When all four operations are SC, both loads cannot read `false`. That result would require each store to come before its own load, while each load came before the other thread's store—a cycle in the total order.

Change the loads to `memory_order_relaxed`, however, and both can read the initial `false`. The SC stores do not upgrade the relaxed loads. Memory order applies to each operation; it is not a protective property attached to the atomic variable as a whole.

This is a small ordering demonstration, not a recipe for mutual exclusion. Use a mutex or a reviewed synchronization primitive to protect a critical section.

## Data-race-free programs and sequential consistency

The SC-DRF principle is a useful way to think about the C++ model: when a program is data-race-free and uses sequentially consistent atomics for its synchronization, its behavior can be reasoned about using a sequentially consistent interleaving of operations. This is one reason ordinary, single-threaded optimizations can coexist with concurrent programs: synchronization marks the points where threads communicate, and data-race freedom gives the implementation room to optimize without changing the program's defined behavior.

This does not mean a debugger or an unsynchronized observer can expect to see each source line execute exactly as written. Nor does it mean that a racy program has merely “unpredictable ordering.” A data race on a non-atomic object is undefined behavior. Make shared access atomic or protect it with synchronization before reasoning about the resulting execution.

## Acquire and release: order only what needs communicating

When one thread publishes data and another consumes it, a release/acquire pair can establish the needed happens-before edge:

```cpp
Payload payload;
std::atomic<bool> ready{false};

// Producer
payload = make_payload();
ready.store(true, std::memory_order_release);

// Consumer
if (ready.load(std::memory_order_acquire)) {
    use(payload);
}
```

If the acquire load reads the value stored by the release operation (or its release sequence), the producer's earlier work happens-before the consumer's later work. The plain `payload` is safe in this pattern only if it is not being modified concurrently and its lifetime is managed correctly.

Acquire/release is not a global order over every operation in every thread. It establishes ordering along a communication path. That can be enough for a publication protocol or a lock, and it can be less restrictive than making every atomic operation sequentially consistent.

## Mutexes, atomics, and fences solve different problems

A mutex protects a critical section: only the thread holding the lock can access the protected region under the program's locking discipline. Lock and unlock operations also establish synchronization. This makes mutexes a strong default when an invariant spans multiple reads and writes.

An atomic operation makes access to one atomic object indivisible and can establish ordering with other operations. It does not automatically turn a sequence of operations on multiple objects into one transaction or critical section. Correct lock-free algorithms often require careful reasoning about every possible interleaving, object lifetime, and sometimes ABA-style changes.

A fence constrains ordering, but a fence is not a standalone message or lock. It normally needs to be paired with the appropriate atomic operations to establish synchronization. Hand-written fences are easy to get wrong and can be difficult to port; prefer mutexes or well-understood atomic operations unless a carefully reviewed algorithm requires a fence.

The options are not interchangeable in every sense. A mutex, a release/acquire protocol, and a lock-free data structure can all coordinate threads, but they offer different guarantees, costs, and complexity. Choose the simplest mechanism that correctly protects the invariant.

## Hardware is the implementation, not the specification

Processors use techniques such as store buffers and out-of-order execution to keep execution units busy. Compilers also transform code while preserving the behavior required by the language. On a weakly ordered architecture, an operation may need an acquire/release instruction or a barrier; on another architecture, the same C++ operation may map to ordinary loads and stores or a different instruction sequence.

The C++ memory order describes what the program requires, not a particular hardware fence. A stand-alone barrier inserted by hand is not a portable substitute for a correctly designed synchronization relationship. First establish the happens-before and atomic-ordering argument; inspect generated code and benchmark only when there is a demonstrated performance need.

## What I’m taking away

`fetch_add` is the simple case: an atomic value changes and returns its old value in one operation. CAS generalizes that idea to “update only if my observation is still current,” which is why it often appears in retry loops. Sequential consistency gives an easier global model; acquire/release can express narrower communication; relaxed operations are for atomics that need no ordering of other data.

The bigger lesson is to begin with the invariant the program must preserve. Protect it with a mutex or a clear atomic protocol, keep the default ordering until correctness is established, and resist the temptation to pull low-level levers before there is a measured reason.
