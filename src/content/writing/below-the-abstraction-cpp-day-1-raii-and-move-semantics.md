---
title: "C++ Day 1, RAII and the Art of Moving"
description: "A first pass through C++ resource lifetimes, value categories, references, and why moving can be cheaper than copying."
publishedAt: 2026-03-24
slug: "cpp-day-1-raii-and-move-semantics"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

The first rule of C++ is that every resource eventually wants to go home. The second rule is that it would prefer not to be carried there by hand.

That is the small joke hiding inside one of C++'s biggest ideas: **RAII**, or Resource Acquisition Is Initialization. It sounds like a pattern about construction, but it is really a way to make the entire lifetime of a resource somebody's responsibility.

## RAII: make lifetime do the work

In C, heap memory is often managed procedurally:

```c
int *buffer = malloc(1024);
/* use buffer */
free(buffer);
```

The allocation and the release are separate calls. That gives the programmer control, but it also gives them another opportunity to forget, return early, or take an error path that skips `free`.

C++ moves that responsibility into an object's lifecycle. A type acquires a resource in its constructor and releases it in its destructor. When the object leaves scope, its destructor runs automatically, including when the scope is left because an exception is thrown.

```cpp
{
    std::lock_guard<std::mutex> lock(mutex);
    // The mutex is locked while lock exists.
} // The destructor unlocks the mutex here.
```

The resource does not have to be memory. Destructors can clean up:

- concurrency primitives such as mutex locks;
- network sockets and file handles;
- graphics pipelines and other device resources.

This is the architectural value of RAII. Instead of asking every caller to remember a cleanup protocol, the type makes invalid or incomplete cleanup harder to express. Resource management becomes a property of scope.

## The names on either side of `=`

Coming from C, lvalues and rvalues initially feel like terminology for something that should be obvious. The distinction becomes useful once objects own resources.

```cpp
int x = 42;
```

Here, `x` is an **lvalue**: it identifies an object with a location and a persistent name. `42` is an **rvalue**: it is a temporary value used to initialize something else.

An lvalue can be used on either side of an assignment:

```cpp
int x = 42;
int& ref = x; // ref is an lvalue reference to x
ref = 100;   // x is now 100
```

An lvalue reference must refer to an existing, named object, so this is not allowed:

```cpp
int& ref = 42; // error: a non-const lvalue reference cannot bind to a temporary
```

An rvalue reference uses `&&` and can bind to a temporary:

```cpp
int&& ref = 42; // valid: ref binds to a temporary
int&& ref2 = x; // error: x is an lvalue
```

The key detail is not simply that an rvalue is “on the right of `=`.” The value category tells C++ what can safely happen to the object next. A named object is likely to be used again. A temporary is approaching the end of its lifetime, so its resources can often be reused rather than copied.

## Copying versus moving

Consider a vector containing a large amount of data:

```cpp
std::vector<int> a = {1, 2, 3, 4, 5};
std::vector<int> b = a;            // copy the elements into new storage
std::vector<int> c = std::move(a); // move the storage from a into c
```

The copy constructs a separate allocation and duplicates each element. The move can transfer the vector's internal pointer, size, and capacity to `c`. The original vector remains valid, but its contents are in a moved-from state and should not be assumed to contain the old elements.

This is why move construction can be dramatically cheaper for large objects. It does not magically make a copy disappear; it changes the operation from “duplicate the resource” to “transfer responsibility for the resource.” That idea pairs naturally with RAII: one object gives up ownership, and another object becomes responsible for cleanup.

`std::move` is worth naming carefully. It does not move anything by itself. It is a cast that tells overload resolution to treat an expression as an expiring value, allowing a move constructor or move assignment operator to be selected.

```cpp
void process(std::string&& text) {
    // text can be used as the source of a move.
}

process("hello");           // a temporary string can bind here
process(std::move(myStr));  // explicitly offer myStr as a movable source
```

After moving from `myStr`, the object still exists and can be assigned a new value or otherwise used according to its type's guarantees. It is not destroyed. Ownership has simply been offered to another object.

## Let overload resolution choose

C++ can expose both operations through overloads:

```cpp
void foo(int& value)  { /* lvalue version */ }
void foo(int&& value) { /* rvalue version */ }

int x = 5;
foo(x);            // lvalue version: x has a name
foo(42);           // rvalue version: 42 is a temporary
foo(std::move(x)); // rvalue version: x is treated as expiring
```

This gives a type a way to behave differently depending on whether the caller is lending it a still-important object or handing it something that can be consumed. For resource-owning types, that difference is the doorway to efficient move operations.

## `int**` is not `&&`

The syntax is easy to confuse when coming from C, but a C double pointer and a C++ rvalue reference solve different problems.

In C++, a reference to a pointer can make a function update the caller's pointer:

```cpp
void findf(int*& value) {
    value = new int(42);
}

int* x = nullptr;
findf(x);
```

`int*&` is an lvalue reference to a pointer. It is roughly the C++ spelling of passing an `int**` when the goal is to modify the pointer itself, but it is not mechanically identical in every respect.

The concepts are separate:

- `*` describes levels of indirection. `int**` means a pointer to a pointer.
- `&` can express an lvalue reference to an existing object.
- `&&` expresses an rvalue reference to an expiring value, which is useful for transferring resources.

The double pointer is about how to reach an object. The rvalue reference is about whether an object can be treated as a source whose resources may be taken.

## A small `unique_ptr`

The standard library already provides `std::unique_ptr`, but a miniature version makes the ownership rules visible:

```cpp
template <typename T>
class unique_ptr {
    T* pointer{};

public:
    unique_ptr() = default;

    explicit unique_ptr(T* value) : pointer{value} {}

    unique_ptr(const unique_ptr&) = delete;
    unique_ptr& operator=(const unique_ptr&) = delete;

    unique_ptr(unique_ptr&& source) noexcept : pointer{source.pointer} {
        source.pointer = nullptr;
    }

    unique_ptr& operator=(unique_ptr&& source) noexcept {
        if (this != &source) {
            delete pointer;
            pointer = source.pointer;
            source.pointer = nullptr;
        }
        return *this;
    }

    ~unique_ptr() {
        delete pointer;
    }

    T* operator->() const { return pointer; }
};
```

Three choices define the type:

1. Copying is deleted, so two objects cannot accidentally believe they own the same pointer.
2. Moving transfers the pointer and nulls the source, leaving one clear owner.
3. Destruction deletes the pointer automatically.

The implementation is small, but the design is powerful. `unique_ptr` turns ownership into a type-level rule and lets scope trigger cleanup. The most important line is arguably the deleted copy constructor: preventing an invalid ownership story is better than trying to repair it after a double delete.

## The first layer below the abstraction

Day one left me with a useful way to read C++ code. When I see a destructor, I should ask what resource it owns. When I see `&&`, I should ask whether an object is being treated as an expiring source. When I see `std::move`, I should look for the ownership transfer that it makes possible.

The syntax is only the surface. Below it are lifetimes, ownership, and the cost of moving bytes around. That is where C++ starts to become less mysterious: not because the language gets smaller, but because the abstractions begin to point at the machinery underneath.
