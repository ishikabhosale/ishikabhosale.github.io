---
title: "C++ Day 8: The Basics of Lock-Free Programming"
description: "What lock-free really guarantees, how atomic read-modify-write operations support it, and when a mutex is still the better choice."
publishedAt: 2026-05-12
slug: "cpp-day-8-lock-free-programming"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

“Lock-free” sounds like a promise about speed. It is actually a promise about progress.

An algorithm can avoid mutexes and still be slow, unfair, or difficult to reason about. To understand lock-free programming, start with the guarantee it makes, then look at the atomics, retries, and memory-lifetime rules needed to uphold it.

## What does lock-free mean?

Concurrent algorithms are often described by their **progress guarantees**:

- **Blocking** algorithms, such as mutex-protected code, may pause a thread until another thread releases a resource.
- **Lock-free** algorithms guarantee system-wide progress: when threads continue taking steps, some operation completes in a finite number of steps. A particular thread can still lose retries indefinitely.
- **Wait-free** algorithms provide a stronger guarantee: every operation completes in a bounded number of its own steps, regardless of what other threads do.

Lock-free is therefore not the same as “every thread always makes progress,” and neither lock-free nor wait-free automatically means “faster.” A lock-free algorithm can burn CPU in a retry loop, contend on one cache line, or perform worse than a mutex for the workload at hand.

There is another distinction: an algorithm designed without locks is not necessarily implemented with lock-free machine operations on every platform. Some `std::atomic<T>` operations may use an internal lock when the type or target lacks a suitable primitive. Check `is_lock_free()` or `is_always_lock_free` when lock-freedom is a requirement, and measure latency and throughput separately.

## Start with the invariant

Before choosing atomics, ask what state must remain consistent. If several fields form one logical invariant, protecting them with one mutex is often clearer and safer than trying to coordinate separate atomic variables.

```cpp
std::mutex mutex;
int balance = 0;

void transfer(int amount) {
    std::lock_guard lock{mutex};
    balance += amount;
    // Other related state can be updated in the same critical section.
}
```

A mutex gives a critical section: only one thread at a time holds the lock, and lock/unlock establish synchronization. The compiler and runtime know where the protected region begins and ends. The costs include possible blocking and the need to avoid deadlocks, but the correctness argument is often simple.

Atomics are useful when the shared state and protocol can be expressed as atomic operations. An atomic variable makes its own operations indivisible; it does not turn arbitrary code around that variable into a transaction.

## Atomic read-modify-write and CAS

For one atomic counter, `fetch_add` performs an indivisible read-modify-write and returns the old value:

```cpp
std::atomic<unsigned> next_id{0};

unsigned allocate_id() {
    return next_id.fetch_add(1, std::memory_order_relaxed);
}
```

This is a natural use for relaxed ordering if the counter only allocates unique values and does not publish other data. If the update must also coordinate access to other objects, the memory order and protocol need a separate happens-before argument.

Compare-and-exchange (CAS) supports conditional updates: “replace the current value with this new value only if it still equals the value I observed.” A simplified lock-free stack push illustrates the pattern:

```cpp
struct Node {
    int value;
    Node* next;
};

std::atomic<Node*> head{nullptr};

void push(Node* node) {
    node->next = head.load(std::memory_order_relaxed);

    while (!head.compare_exchange_weak(
        node->next,
        node,
        std::memory_order_release,
        std::memory_order_relaxed
    )) {
        // On failure, node->next is updated with the observed head.
    }
}
```

On a failed attempt, `compare_exchange_weak` updates the `expected` argument—in this case `node->next`—with the observed head, and the loop retries. The release store publishes the initialized node to a thread that later successfully observes it with an acquire operation.

This is only a sketch of a push operation, not a complete production stack. A real concurrent stack must also define `pop`, node ownership, destruction, and safe memory reclamation. Those details are where many lock-free examples become substantially harder than the CAS loop itself.

## Why compare-exchange loops are common

With multiple writers, a thread can calculate a desired update from a value that another thread changes before the write occurs. CAS checks that the observation is still current:

```cpp
std::atomic<int> shared_max{0};

void try_update(int candidate) {
    int current = shared_max.load(std::memory_order_relaxed);

    while (candidate > current &&
           !shared_max.compare_exchange_weak(
               current,
               candidate,
               std::memory_order_relaxed,
               std::memory_order_relaxed)) {
        // `current` has been refreshed; test and retry.
    }
}
```

The loop exits either when this thread successfully raises the maximum or when it learns the current value is already at least the candidate. `weak` may fail spuriously, so retry loops commonly use it. `strong` rules out spurious failure, but either operation can fail because a competing thread changed the value.

Contention can make many threads retry the same cache line. A lock-free algorithm may therefore have a system-wide progress guarantee and still scale poorly when many writers compete.

## The ABA problem and object lifetime

CAS compares a value, not the history that produced it. In a pointer algorithm, a thread can observe pointer `A`, pause, and later find that the pointer is `A` again—even though another thread removed the original node and a different node now occupies the same address. The value appears unchanged, but the structure may have changed in between. This is the **ABA problem**.

Pointer reuse also makes memory reclamation critical. A node cannot be deleted while another thread might still be reading it. Lock-free structures often use techniques such as hazard pointers, epoch-based reclamation, or tagged pointers to manage these risks. Each technique has tradeoffs, and a raw pointer plus CAS is not enough to make a safe concurrent container.

## A practical way to choose

The flow of questions is useful as a starting point, but it is not a formula that selects an algorithm automatically:

1. **Can a mutex express the invariant clearly?** Prefer that baseline unless blocking is unacceptable or measurement shows a real bottleneck.
2. **Are there multiple writers?** If so, a compound update may need a read-modify-write operation such as `fetch_add` or a CAS loop. Independent atomic stores are not a transaction.
3. **Is the algorithm a simple producer/consumer publication protocol?** Release/acquire may be enough, provided the acquire actually observes the release and the data lifetime is sound.
4. **Does the algorithm require a stronger ordering?** Start with sequential consistency for a clear baseline. Weaken it only after writing down the correctness argument and testing the implementation.
5. **Does the target provide the required lock-free atomics?** Verify the actual type and target. Do not assume `std::atomic<T>` is always lock-free.
6. **Have you measured the real workload?** Compare throughput, tail latency, CPU consumption, and fairness—not just a tiny uncontended microbenchmark.

Do not make an algorithm “sloppy” because it currently runs only on x86-64. The C++ memory model is the contract across compiler and hardware targets. x86's relatively strong ordering can hide mistakes that become visible on ARM or another weakly ordered architecture. Correctness should come from C++ synchronization operations, not assumptions about one processor's current behavior.

## Fences are rarely the first tool

A fence constrains ordering, but does not by itself identify which data is being published or who receives it. Correct fence-based protocols need appropriate atomic operations around the fences. This is subtle, and a fence inserted after noticing a failing test does not automatically repair a data race.

Prefer a mutex, a well-understood atomic operation, or a reviewed algorithm. Use explicit fences only when the synchronization design calls for them and the happens-before argument is clear. The goal is not to eliminate every barrier; it is to express the required ordering with the simplest correct abstraction.

## What I’m taking away

Lock-free programming is about system-wide progress, not a guarantee that every operation is fast or every thread wins. Atomics and CAS provide building blocks, but safe lock-free structures also need correct ordering, contention analysis, and a plan for object lifetime and reclamation.

The best first question is not “How do I remove this mutex?” It is “What invariant must these threads preserve, and what is the simplest mechanism that preserves it?” If a mutex is clear and fast enough, it is already a good solution. Reach for lock-free techniques when their progress properties matter—and be ready to prove and measure the whole design, not just the atomic instruction.
