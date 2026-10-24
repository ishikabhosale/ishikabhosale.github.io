---
title: "C++ Day 5: Cache Hierarchies and False Sharing"
description: "A tour of cache latency, cache lines, set associativity, coherence, and why nearby data can slow down independent threads."
publishedAt: 2026-04-21
slug: "cpp-day-5-cache-hierarchies"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

The processor can execute instructions far faster than main memory can deliver arbitrary data. The memory hierarchy is how a computer narrows that gap: a small amount of fast storage sits close to the cores, backed by progressively larger and slower levels. That design makes locality one of the most important properties of performance-sensitive code.

The numbers below are illustrative, not promises about every processor. Cache sizes, latencies, line sizes, and sharing policies vary by microarchitecture, and even one machine can have different behavior under different workloads.

| Level                       |                       Illustrative capacity |                                    Approximate latency |
| --------------------------- | ------------------------------------------: | -----------------------------------------------------: |
| Registers                   |      Small, managed by the compiler and CPU | Part of instruction execution; not directly comparable |
| L1 data cache               |                  Roughly 32–48 KiB per core |               About 4–5 cycles, around 1–2 ns at 3 GHz |
| L2 cache                    |              Roughly 256 KiB–2 MiB per core |                      About 12–15 cycles, around 4–5 ns |
| Last-level cache (often L3) | Several MiB to tens of MiB, commonly shared |                    About 35–70 cycles, around 12–23 ns |
| Main memory (DRAM)          |                                   GiB-scale |                 About 200–300 cycles, around 67–100 ns |

At 3 GHz, one cycle is about $0.33$ ns. A dependent trip to DRAM can therefore take dozens of times longer than an L1 hit. A processor may overlap independent work or other memory requests, but when an instruction must wait for a particular missing value, arithmetic elsewhere in the program cannot always hide that dependency.

## Why there are multiple cache levels

Fast SRAM takes more chip area and power per bit than DRAM, so making every byte of memory as fast as L1 is not practical. Instead, a processor keeps a small, fast working set nearby and relies on larger levels for data that is less frequently used.

Most processors split L1 into an instruction cache (L1i) and a data cache (L1d). This lets the front end fetch instructions while the execution side reads or writes data. It is a Harvard-style separation at the cache level, even though instructions and data ultimately live in the same address space and memory system.

A textbook five-stage pipeline—fetch, decode, execute, memory, writeback—helps illustrate the overlap: while one instruction is in its memory stage, a later instruction might be fetched. Real processors generally use deeper, more complex, often out-of-order pipelines, but the basic point remains: instruction fetch and data access can be needed at the same time. Separate L1 paths help serve both.

## The cache line: the unit that moves

Caches do not usually fetch one requested byte from DRAM in isolation. They transfer data in blocks called **cache lines**. A 64-byte line is common on current x86 processors, though code should not assume that every architecture uses that size.

If the processor reads a four-byte integer, the cache may bring in the line containing it. Nearby values then arrive too, which is why walking an array sequentially is often efficient: a single fill can provide several adjacent elements. This is **spatial locality**. Reusing recently accessed data is **temporal locality**.

The line is also commonly the unit of cache coherence. That creates a less intuitive consequence: two independent variables can occupy the same line. Threads that update different variables may then interfere with one another at the hardware level, despite having no logical data dependency.

## False sharing: independent fields, shared line

Imagine two counters stored next to each other:

```cpp
struct Counters {
    std::atomic<std::uint64_t> producer;
    std::atomic<std::uint64_t> consumer;
};
```

Suppose one core repeatedly updates `producer` and another repeatedly updates `consumer`. If both counters fall in the same cache line, the cores still need to coordinate ownership of that whole line. A write that obtains the line for modification can invalidate other cached copies of it, including the copy used by the other core for its separate counter.

The line can then bounce between cores. Each thread spends time reacquiring a line even though neither thread reads or writes the other's counter. This performance problem is called **false sharing**. It is distinct from a data race: the atomic counters provide safe concurrent updates, but their physical placement can still hurt throughput.

Coherence protocols such as MESI describe states including Modified, Exclusive, Shared, and Invalid. The exact protocol and transitions vary, but a simplified picture is useful:

- **Modified**: this cache has changed the line and holds the up-to-date copy;
- **Exclusive**: this cache has the clean line and no other cache is known to have it;
- **Shared**: multiple caches may hold clean copies;
- **Invalid**: this cache's copy cannot be used.

If another core wants to write a shared line, it must obtain permission to modify it and other copies are invalidated. A common term for the request is **Read For Ownership (RFO)**. The protocol protects consistency at line granularity, not at the granularity of individual C++ fields.

Padding or alignment can separate frequently written data:

```cpp
#include <atomic>
#include <cstdint>

struct alignas(64) PaddedCounter {
    std::atomic<std::uint64_t> value{0};
};

PaddedCounter producerIndex;
PaddedCounter consumerIndex;
```

Here, 64 bytes is an illustrative target-specific choice, not a portable cache-line guarantee. Some standard libraries expose `std::hardware_destructive_interference_size` as a suggested spacing value; its availability and value depend on the implementation. Measure first, and use platform-aware alignment when the workload shows false sharing. Padding every field indiscriminately can waste memory and make cache behavior worse.

This technique is useful in structures such as single-producer/single-consumer queues, where different cores frequently update separate indices. It is not a substitute for correct synchronization when threads actually share the same data.

## Sets, ways, tags, and offsets

A cache is not usually a single pool where any memory line can occupy any slot. In a set-associative cache, an address maps to one set, and it can occupy one of a limited number of ways in that set. This keeps lookup hardware manageable while allowing more flexibility than a direct-mapped cache.

Consider a simplified 32 KiB cache with 64-byte lines and 8-way associativity:

1. There are $32 \times 1024 / 64 = 512$ line slots.
2. Eight ways per set gives $512 / 8 = 64$ sets.
3. A 64-byte line needs 6 offset bits to select a byte within the line.
4. Sixty-four sets need 6 index bits to select a set.

If we also assume a simple 30-bit byte address and conventional indexing, the remaining tag is $30 - 6 - 6 = 18$ bits:

```text
| Tag: 18 bits | Set index: 6 bits | Line offset: 6 bits |
```

The set-index bits choose the set. The tag distinguishes which of the many possible memory lines mapping to that set is currently present. The offset selects the requested byte within the matching line. With 8 ways, the cache can keep up to eight candidates for that set at a time.

This makes **conflict misses** possible. If a workload repeatedly touches more lines mapping to one set than the set has ways, those lines can evict one another while other sets remain underused. Real cache indexing can be more complex than this simplified diagram—for example, physical addresses and hashing may be involved—so the bit split is a teaching model, not a universal implementation description.

### Are tag and data stores separate?

It is useful to think of each cache as having tag metadata and a data array. For each possible line slot, the metadata includes a tag and status bits, while the data array holds the cache line itself. The set index identifies corresponding entries.

The hardware implementation is not necessarily a simple sequence where it reads the tags first and only then reads data. Many caches access tag and data structures in parallel, then use the tag comparison to select the matching way; other designs use techniques such as way prediction. Keeping the conceptual roles separate helps explain lookup, but the timing and physical organization depend on the processor.

Cache hierarchies also differ in whether their levels are inclusive, exclusive, or non-inclusive. In an inclusive design, a line present in a closer cache is also represented in a farther level; exclusive designs try to avoid duplicate contents; non-inclusive designs do not promise either property. These choices affect effective capacity and coherence bookkeeping, and they vary across processors and generations.

## More threads do not always mean more throughput

Simultaneous multithreading (SMT), marketed by Intel as Hyper-Threading on supported processors, exposes multiple logical CPUs on one physical core. Each logical CPU has its own architectural state, while many execution resources and cache structures are shared in implementation-specific ways.

SMT is not simply a rule that only one thread can execute at a time. A core may issue instructions from different hardware threads in the same cycle when execution resources are available. One benefit is making progress from another thread when the first cannot use all the core's resources—for example, while it waits on a long-latency memory operation.

There is a tradeoff: sibling threads can compete for execution capacity and cache space. If both have large, overlapping or cache-hungry working sets, they may evict useful lines or contend for shared resources. If their stalls leave different resources idle, running both can improve total throughput. The result depends on the processor and workload; “SMT helps” and “SMT hurts” are both too broad without measurement.

## What I’m taking away

Memory performance is not just about how many operations the source code contains. It also depends on which data those operations touch, how close that data is to the core, whether accesses have locality, and whether another core needs the same cache line.

The practical sequence is simple: make access patterns predictable, keep data that is used together close together, watch for false sharing in frequently updated fields, and measure on the hardware that matters. The cache hierarchy is automatic, but understanding its units—lines, sets, and ownership—helps explain why code that looks independent can still compete for the same physical resources.
