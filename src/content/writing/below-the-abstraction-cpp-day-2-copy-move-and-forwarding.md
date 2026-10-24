---
title: "C++ Day 2: Copying, Moving, and Forwarding"
description: "A closer look at copy and move constructors, the Rule of Five, and how forwarding references preserve value categories."
publishedAt: 2026-03-31
slug: "cpp-day-2-copy-move-and-forwarding"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

Yesterday's question was who cleans up a resource. Today's is what happens when an object that owns one gets copied—or handed to someone else.

The difference matters because a compiler can copy the bits of a pointer without copying the resource it points to. To make ownership behave correctly, a resource-owning type needs to define what copying and moving mean.

## Copy means a second owner—with separate storage

Suppose a small `String` stores its characters in a dynamically allocated, null-terminated buffer. A copy constructor should allocate a new buffer and copy the characters into it:

```cpp
#include <cstring>

class String {
public:
    std::size_t size{};
    char* data{};

    String(const String& other)
        : size{other.size}, data{new char[other.size + 1]} {
        std::memcpy(data, other.data, size + 1); // include the '\0'
    }

    ~String() {
        delete[] data;
    }
};
```

Now each `String` owns a different allocation. Destroying or changing one won't invalidate the other. By contrast, a compiler-generated copy of a raw pointer only copies its address; both objects would point at the same buffer and could both try to delete it.

This example assumes `other.data` always points to a valid null-terminated buffer. Real string types need to handle allocation failure and maintain their invariants across every operation. In ordinary C++ code, prefer `std::string` or another well-designed owning type over hand-managing a character buffer.

## Move means transfer the resource

When a source object is no longer needed, a move constructor can take its allocation rather than allocate and copy another one:

```cpp
String(String&& other) noexcept
    : size{other.size}, data{other.data} {
    other.size = 0;
    other.data = nullptr;
}
```

The destination now owns the buffer. The source remains a valid object, but this class leaves it empty. A moved-from standard-library object is generally valid but has a type-specific, unspecified state; don't assume it is empty unless the type promises that.

`noexcept` is an exception specification: it says an exception will not escape this function. If one does escape a `noexcept` function, the program calls `std::terminate`. A move constructor that only transfers a pointer and resets a few fields has no reason to throw, so declaring it `noexcept` is appropriate. It also helps standard containers use the move operation during reallocation when they need to preserve exception-safety guarantees.

The useful guideline is: make move construction and move assignment `noexcept` when they truly cannot throw. Do not add the annotation if the implementation might throw; it is a contract, not a performance hint to apply blindly.

## The Rule of Five—and the Rule of Zero

The Rule of Five says that when a type directly manages a resource and needs to define any of these special member functions, consider the full set:

1. destructor;
2. copy constructor;
3. copy assignment operator;
4. move constructor;
5. move assignment operator.

For example, a destructor that releases a raw allocation changes the ownership story. A shallow compiler-generated copy would duplicate the pointer, not the allocation. Meanwhile, declaring a destructor or copy operation affects whether implicit move operations are generated, so the type may need to define its move operations explicitly as well.

That doesn't mean every type with a destructor must manually implement all five. The better default is often the **Rule of Zero**: store resources in types such as `std::string`, `std::vector`, and `std::unique_ptr`, then let their special member functions manage the details. Write custom copy and move operations only when the type itself needs custom ownership semantics.

## Where moves show up

Moves often happen through ordinary-looking code, but the exact behavior depends on the type and the context.

### Returning a local

```cpp
std::vector<int> make_vector() {
    std::vector<int> values{1, 2, 3};
    return values;
}
```

The compiler can construct `values` directly in the caller's return slot using named return value optimization (NRVO). NRVO is permitted but not guaranteed for a named local. If that elision does not happen, returning the local can use an implicit move; it is not necessary to write `std::move(values)` here, and doing so can prevent NRVO.

### Passing an expiring value

```cpp
std::vector<int> values{1, 2, 3};
consume(std::move(values));
```

If `consume` accepts an rvalue and the vector's move operation is selected, its internal storage can be transferred. `std::move` itself does not move the vector; it allows overload resolution to select a move-aware operation. Afterward, `values` is still valid, but its contents are unspecified by the general moved-from guarantee.

### Adding elements to a container

```cpp
std::vector<std::string> words;
words.push_back(std::string{"hello"}); // inserts from a temporary
words.emplace_back("world");           // constructs the string in place
```

The first call can move the temporary string into the vector. The second constructs the string at the end of the vector without first creating a separate `std::string` temporary. Reallocation of the vector may still move or copy its existing elements. `emplace_back` is not automatically faster in every situation; it is useful when constructing an element directly from its constructor arguments.

## Forwarding references: keep the caller's intent

An rvalue reference such as `std::string&&` accepts rvalues only. A different pattern appears in a function template:

```cpp
template <typename T>
void wrapper(T&& argument) {
    target(std::forward<T>(argument));
}
```

When `T` is deduced for this parameter, `T&&` is called a **forwarding reference** (historically, a “universal reference”). It can bind to an lvalue or an rvalue, and template deduction records which category was passed:

```cpp
std::string name = "Ada";

wrapper(name);                // T is std::string&
wrapper(std::string{"Ada"}); // T is std::string
```

For the lvalue call, reference collapsing turns `T&&` into `std::string&`. For the temporary, it becomes `std::string&&`. The parameter is named inside the function, so the expression `argument` is an lvalue either way. `std::forward<T>(argument)` conditionally casts it back to the category recorded by `T`:

- if the caller passed an lvalue, it is forwarded as an lvalue;
- if the caller passed an rvalue, it is forwarded as an rvalue.

This lets `target` choose the matching overload without needlessly moving from an lvalue. By contrast, `std::move(argument)` would always cast the expression to an rvalue, even when the caller passed a named object they still need.

Not every `T&&` is a forwarding reference. The `T` must be deduced for that parameter. For example, `std::string&&` is an ordinary rvalue reference, and so is `std::vector<T>&&` when `T` was already determined by the surrounding class template.

## A quick reading rule

When you encounter `Widget&& value`, ask whether `Widget` is being deduced at that point:

- If not, it is an rvalue reference. Use `std::move(value)` when you intentionally want to treat the named parameter as an expiring source.
- If it is a deduced template parameter in the forwarding-reference pattern, preserve the caller's value category with `std::forward<T>(value)`.

Day two connects the mechanics back to ownership. Copying makes an independent resource; moving transfers one; forwarding preserves the caller's choice so the right operation can happen downstream. Once those three intentions are clear, the punctuation starts to tell a story rather than look like a collection of ampersands.
