---
title: "SPSC Ring Buffer"
summary: "A header-only C++17 single-producer/single-consumer queue, with focused concurrency tests and comparative benchmarks."
slug: "spsc-ring-buffer"
technologies:
  - "C++17"
  - "CMake"
  - "Google Benchmark"
featured: true
order: 2
repositoryUrl: "https://github.com/ishikabhosale/spsc_ring_buffer"
year: 2026
---

## Problem

When two threads need to hand off data, a general-purpose queue can introduce synchronization overhead they do not need. This project explores a simpler option for the specific case of one producer and one consumer: a bounded FIFO with clear behavior when it is full or empty.

## Approach

The queue is a header-only C++17 template with a fixed capacity. The producer can insert with `try_push()` or `try_emplace()`; either returns `false` when the queue is full. The consumer uses `try_pop()`, which returns an empty optional when there is no item to read. The API supports move-only values and makes the single-producer/single-consumer constraint explicit.

Atomic cursors coordinate access between the two threads. Release/acquire operations publish inserted values and make consumed slots available again. The cursor and slot layout separates independently accessed data using destructive-interference spacing to help reduce false sharing, trading additional memory use for that separation.

## Validation

The test suite covers capacity-one behavior, full and empty transitions, repeated wraparound, move-only payloads, and a concurrent producer/consumer stress test. A Google Benchmark suite compares the ring buffer with a mutex-protected `std::queue` and Boost's SPSC queue across several payload sizes. It records throughput as well as enqueue-to-dequeue latency percentiles.

## Outcome

The project is a compact study of queue semantics, C++ atomics, cache behavior, and benchmark design. Results are recorded as local snapshots rather than universal performance claims: throughput and latency vary with payload size, scheduling, and hardware.
