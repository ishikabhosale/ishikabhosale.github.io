---
title: "C++ Day 3: Compile-Time Choices and Modern Initialization"
description: "A practical tour of constexpr, if constexpr, templates, and safer initialization choices in modern C++."
publishedAt: 2026-04-07
slug: "cpp-day-3-constexpr-templates-initialization"
language: "en"
topic: "Below the Abstraction"
draft: false
featured: false
---

Day one was about lifetimes; day two was about what happens when values move between objects. Today the compiler gets to do some of the work before the program even runs. It can evaluate known values early, generate code for the types we use, and discard template branches that do not apply.

The afternoon reading was _Effective Modern C++_, Items 7–10, on initialization, null pointers, type aliases, and enums. Here are the ideas I’m carrying forward, in my own words.

## `constexpr`: a value the compiler can know

`constexpr` says that a variable or function is eligible for constant evaluation. A `constexpr` variable must be initialized by a constant expression; `const` only says that the variable cannot be changed after initialization.

```cpp
constexpr int base = 10;
constexpr int doubled = base * 2;

int input;
std::cin >> input;
const int fixedInput = input; // fine: it won't change after initialization
// constexpr int compileTimeInput = input; // error: input is only known at runtime
```

That distinction matters when a language feature requires a compile-time constant, such as a non-type template argument, a `case` label, or a `static_assert` condition. Some array declarations also require a constant bound, though standard C++ does not support variable-length arrays as a general runtime-sized local-array feature.

```cpp
constexpr int bufferSize = 256;
char buffer[bufferSize];
```

## A `constexpr` function can still run at runtime

A `constexpr` function can participate in compile-time evaluation when its arguments and operations allow it. Calling it with runtime data does not require the compiler to know the answer in advance.

```cpp
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int fiveFactorial = factorial(5);
static_assert(fiveFactorial == 120);

int runtimeInput = get_user_input();
int runtimeResult = factorial(runtimeInput);
```

The first call can be evaluated during compilation; the last call is evaluated at runtime. Compile-time evaluation is useful when a constant is required or when it simplifies work at runtime, but it is not “free”: the compiler still has to perform that work, and compile-time computation should remain reasonable.

Compared with a macro, a `constexpr` function has a real type, follows normal scope and name lookup, and is checked as C++ code. That makes it easier to compose and debug.

## Templates: write the pattern, instantiate the type

Templates let us describe an operation once and let the compiler instantiate it for the types used by the program. For example:

```cpp
template <typename T>
T max_value(T left, T right) {
    return left > right ? left : right;
}

int biggerInt = max_value(3, 7);                 // T is int
double biggerDouble = max_value(2.5, 1.1);       // T is double
std::string longer = max_value(std::string{"a"}, std::string{"b"});
```

The compiler deduces `T` from the arguments and instantiates the function for that type. The arguments must fit the template's deduction rules: for example, `max_value(3, 2.5)` does not deduce one `T` from two different argument types. We can choose the type explicitly, or design a template that accepts and compares two distinct types when that is appropriate.

Class templates use the same idea:

```cpp
template <typename T>
class Box {
public:
    explicit Box(T value) : value_{std::move(value)} {}

    const T& get() const { return value_; }

private:
    T value_;
};

Box<int> number{42};
Box<std::string> greeting{std::string{"hello"}};
```

Types such as `std::vector<T>`, `std::map<Key, Value>`, and `std::unique_ptr<T>` are standard-library class templates. `std::vector<int>` is a specialization of the vector template for `int`.

## `if constexpr`: choose a branch for a type

A normal `if` chooses which statement executes at runtime. In a template, both branches still need to be valid for each instantiation. That is a problem if one branch uses an operation that only exists for some types.

```cpp
#include <type_traits>

template <typename T>
auto get_value(T value) {
    if constexpr (std::is_pointer_v<T>) {
        return *value;
    } else {
        return value;
    }
}
```

With `if constexpr` (C++17), the condition is evaluated at compile time. For a particular instantiation, the non-selected branch is discarded, so `get_value(42)` does not need to make `*value` valid for an `int`. This is especially useful when templates have type-dependent operations or return types.

The discarded branch is not a blanket exemption from parsing and checking. Code that is non-dependent on the template parameters can still be diagnosed when the template is defined. The useful case is code whose validity depends on the type being instantiated.

## Initialization: parentheses and braces have different rules

C++ offers several initialization forms, and they are not interchangeable in every case:

```cpp
int count(0); // direct initialization with parentheses
int total{0}; // direct-list initialization with braces
```

Braces reject many narrowing conversions, which can catch accidental loss of information:

```cpp
int whole{3.14}; // error: narrowing conversion
int roundedDown(3.14); // allowed, but truncates to 3
```

Braces also avoid the “most vexing parse,” where parentheses can make a declaration look like a function declaration:

```cpp
struct Widget {};

Widget make_widget(); // declares a function, not an object
Widget widget{};      // creates an object
```

There is a tradeoff: list-initialization gives `std::initializer_list` constructors priority. A type with such a constructor may behave differently with braces than with parentheses. So braces are useful for their safety and clarity, but knowing which constructor they select still matters.

## Null pointers should say what they are

The integer literal `0` can also act as a null pointer constant, and the historical `NULL` macro may be an integer value. That can make overload resolution surprising:

```cpp
void inspect(int);
void inspect(char*);

inspect(0);       // selects the integer overload
inspect(nullptr); // selects the pointer overload
```

Prefer `nullptr` to `0` or `NULL` when representing a null pointer. It has the dedicated type `std::nullptr_t`, making the intent clear. Overload sets that mix pointer and integral parameters deserve particular care because old null-pointer spellings can select an unintended overload.

## Alias templates: name a family of types

A `typedef` can give one existing type another name, but it cannot directly declare a parameterized family. An alias declaration can:

```cpp
template <typename T>
using Vector = std::vector<T>;

Vector<int> scores;
```

Aliases can also simplify type-trait results. Modern C++ provides `_t` forms such as `std::remove_const_t<T>` instead of requiring the longer `typename std::remove_const<T>::type` spelling:

```cpp
template <typename T>
using Mutable = std::remove_const_t<T>;
```

This keeps template code easier to scan, while retaining the type transformation's compile-time behavior.

## Scoped enums: make names and conversions deliberate

An unscoped enum places its enumerator names in the surrounding scope and can convert to an integer implicitly. A scoped enum, introduced with `enum class`, keeps its names inside the enum and does not implicitly convert to an integer:

```cpp
enum class ConnectionState { offline, connecting, online };

ConnectionState state = ConnectionState::online;
int code = static_cast<int>(state); // make the conversion explicit
```

Both scoped and unscoped enums can specify an underlying integer type. A scoped enum defaults to `int`; an unscoped enum without an explicit underlying type has an implementation-selected integral type. Scoped enums can be forward-declared without spelling an underlying type, while an unscoped enum needs one stated in its forward declaration.

Scoped enums make accidental name collisions and implicit integer conversions less likely. When the enum is intended to model a distinct set of choices, `enum class` is usually the clearer default.

## What I’m taking into Day 4

`constexpr` moves eligible computation earlier. Templates let types shape generated code, and `if constexpr` lets the compiler discard type-specific branches. Initialization syntax communicates constraints, while `nullptr`, aliases, and scoped enums make intent more explicit.

The common thread is that C++ gives us ways to state more of our intent in types and syntax. The compiler can then check it, select the right operation, or reject a mistake before the program reaches runtime.
