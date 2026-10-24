---
title: "C++ Day 4: Views, Moves, and Forwarding"
description: "A practical look at std::span, std::string_view, move semantics, and forwarding references in modern C++."
publishedAt: 2026-04-14
slug: "cpp-day-4-views-and-forwarding"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

Day four is about two ways to avoid unnecessary work: look at data without owning or copying it, and transfer a resource when its current owner is finished with it. The catch is that both techniques make lifetime and value category matter more, not less.

One important distinction runs through the article: a normal rvalue reference accepts expiring values, while a forwarding reference preserves whether its caller supplied an lvalue or an rvalue. That distinction also explains why generic code that accepts ranges may need forwarding references rather than a `const` reference.

## A view is not an owner

`std::span` (C++20) is a small, non-owning view over a contiguous sequence. It carries a pointer and a count, so a function can accept arrays, vectors, or other contiguous storage without being tied to one container type:

```cpp
#include <array>
#include <span>
#include <vector>

int sum(std::span<const int> values) {
    int result = 0;
    for (int value : values) {
        result += value;
    }
    return result;
}

std::vector<int> numbers{1, 2, 3};
int total = sum(numbers);
```

The `const` element type means the function can read the integers but cannot change them through this span. It does not make the span own or extend the lifetime of the vector. The caller must ensure the viewed storage outlives the span and every use of it.

A span may have a runtime or compile-time extent:

```cpp
std::span<int> dynamicView;    // extent is determined at runtime
std::array<int, 5> storage{};
std::span<int, 5> fiveValues{storage}; // extent is part of the type
```

The fixed-size example needs an `<array>` include, while a dynamically sized span can be default-constructed empty.

Spans provide `size()`, `empty()`, `front()`, `back()`, `data()`, iterators, and non-owning slices such as `first()`, `last()`, and `subspan()`. They make pointer-and-length interfaces clearer, but do not automatically make every access bounds-checked: `operator[]` has a valid-index precondition. A span is a view over contiguous storage, not a general replacement for every pointer or range.

## `std::string_view`: a view of characters

`std::string_view` (C++17) applies the same idea to character sequences. It is useful for read-only parameters because it can refer to a `std::string`, a string literal, or a substring without allocating a new string:

```cpp
#include <string_view>

bool is_greeting(std::string_view text) {
    return text == "hello";
}

std::string message = "hello, C++";
bool result = is_greeting(message);
```

It is similar in spirit to `std::span<const char>`, with string-oriented operations such as comparisons and substring search. It is not a `std::string` and does not own or copy the characters.

That means the same lifetime rule applies: do not keep a view after its backing characters are gone or invalidated. Be especially cautious about returning a view into a local string. Also, a `string_view` is a pointer plus a length, not necessarily a null-terminated C string. Use `.data()` as a `const char*` only when the receiving API's termination and length requirements are satisfied. For C APIs that need a null-terminated buffer, an owning `std::string` may be the safer bridge.

## Moving: transfer when the source can be consumed

Copying an lvalue into a container preserves the original and creates a separate value:

```cpp
std::vector<std::string> collection;
collection.reserve(3);

std::string text = get_data();
collection.push_back(text); // copies; text remains unchanged
```

Since C++11, a container can also move from an expiring value:

```cpp
collection.push_back(get_data()); // temporary string can be moved into the vector
collection.push_back(std::move(text)); // explicitly allow text to be moved from
```

The move can transfer the string's owned buffer instead of allocating and copying all its characters. The source remains a valid object, but its state after moving is generally unspecified unless that type documents a stronger guarantee.

`std::move(value)` is essentially a cast to an rvalue reference; it does not move by itself. The selected operation decides whether resources are transferred. For example, moving from a `const` object often copies instead:

```cpp
const std::string fixed = get_data();
collection.push_back(std::move(fixed)); // normally copies: move needs non-const string&&
```

The usual move constructor takes `std::string&&`, which cannot bind to `const std::string&&` without dropping constness. Since moving typically modifies the source, `const` and “may be moved from” often work against each other. Avoid making an object const if you intend to transfer its value later.

## Special members and polymorphic bases

The compiler only implicitly declares move construction and move assignment when the class has no user-declared copy constructor, copy assignment operator, move constructor, move assignment operator, or destructor. A user-declared destructor—often virtual in a polymorphic base—therefore prevents the compiler from implicitly declaring those move operations for that class.

```cpp
struct Person {
    std::string id;
    virtual void print() const = 0;
    virtual ~Person() = default; // user-declared destructor; no implicit moves
};

struct Customer : Person {
    std::vector<int> data;
    void print() const override;
};
```

`Person` is abstract because it has a pure virtual function; it cannot be instantiated directly, and a concrete derived class must provide `print()`. A `Customer` may still have an implicitly declared move operation of its own, but moving its `Person` base subobject can fall back to copying if the base is copyable. That can make an apparently successful derived move copy an expensive base member instead.

This is not a reason to add move operations to every polymorphic base. Moving polymorphic objects through base values can cause slicing, and ownership is often handled through pointers instead. If a base truly needs efficient value-like movement, define and test its special-member policy explicitly; avoid adding a derived destructor that is only `= default` unless it is needed, because it too is user-declared and affects implicit moves.

## How `&&` changes meaning

An ordinary rvalue reference accepts rvalues:

```cpp
void consume(std::string&& value);

std::string name = "Ada";
// consume(name);            // error: name is an lvalue
consume(std::move(name));    // okay: explicitly treat name as expiring
consume(std::string{"Ada"}); // okay: temporary is an rvalue
```

But in a function template where the type is being deduced, `T&&` can be a **forwarding reference**:

```cpp
template <typename T>
void call_target(T&& value) {
    target(std::forward<T>(value));
}
```

The deduction records the argument's category. For an lvalue of type `X`, `T` is deduced as `X&`; reference collapsing makes `T&&` become `X&`. For an rvalue of type `X`, `T` is `X`, so the parameter becomes `X&&`. `std::forward<T>` then restores the category at the call to `target`.

Reference overloads can express three different access intentions:

```cpp
void inspect(const Widget&); // read-only access; binds to lvalues and rvalues
void inspect(Widget&);       // mutable access to non-const lvalues
void inspect(Widget&&);      // access to non-const rvalues; can consume
```

For a generic parameter, `T&&` plus `std::forward<T>` provides the same category-sensitive behavior without listing every type. `std::move(value)` would instead cast the named parameter to an rvalue every time, even if the caller supplied an lvalue.

The term “forwarding reference” applies when `T` is deduced for that parameter. It is not a property of every spelling containing `&&`: `Widget&&` is an ordinary rvalue reference, and a class-template member parameter such as `std::vector<T>&&` is not forwarding `T` when `T` was already fixed by the class specialization.

## Why generic range code often uses `auto&&`

The same deduction principles apply to `auto&&` in a local variable. For a non-braced initializer, it can bind to an lvalue or a temporary and preserve its constness and value category in the deduced reference type:

```cpp
std::string return_temporary_string();
const std::string& return_string_reference();

std::string original = "named string";

auto&& first = original;                  // std::string&
auto&& second = return_temporary_string(); // std::string&&
auto&& third = return_string_reference();  // const std::string&
```

The variable itself has a name, so using `second` as an expression is an lvalue. If we want to pass the result on while preserving its original category, we can forward using its declared type:

```cpp
auto&& result = compute();
process(std::forward<decltype(result)>(result));
```

This pattern can be handy when something must happen between producing a value and passing it onward. It does not extend the lifetime of an arbitrary object returned by reference, so the usual lifetime checks still apply.

Generic range functions have a related issue. Some ranges are views whose iteration operations are only available on a non-const range, or whose `begin()` updates internal state. Requiring `const Range&` can therefore reject useful ranges. A forwarding-reference parameter preserves whether the supplied range is mutable and whether it is an lvalue or temporary:

```cpp
#include <ranges>

template <std::ranges::viewable_range R>
void print_elements(R&& range) {
    for (auto&& element : range) {
        std::cout << element << '\n';
    }
}
```

The `R&&` parameter lets the function accept lvalue containers, temporary views, and ranges with non-const iteration when the constraints are met. `auto&&` for each element similarly supports proxy references and preserves constness rather than making an unnecessary copy. Use the standard range concepts and lifetime rules; forwarding a temporary range does not make it safe to retain iterators or references after the range has died.

## A mental model to keep

Views borrow; they do not own. Moving offers an expiring source to an operation that may transfer its resources. Forwarding preserves the caller's value category so downstream overload resolution can make the right choice.

That makes the abstractions powerful but not magical. With `span`, `string_view`, `std::move`, and `std::forward`, the important questions remain concrete: who owns the storage, how long does it live, and is this object still needed after the call?
