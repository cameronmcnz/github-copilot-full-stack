---
applyTo: "**/*.java"
---

# Java Instructions

Always use Java 25.

Apply Java 25 style, constructs and idioms whenever possible.

Do not use logging frameworks. Use IO.println() for logging and tracing.

Prefer records over Java classes. Use immutable data where practices.

Avoid lambda expressions.

Maven is the build tool of choice.

When using dependency injection, prefer field injection over constructor or setter injection.

When creating a new feature, respect BCE packaging rules and keep boundary, controller and entity classes grouped under the same feature root.

Ensure every method in a boundary class has at least one IO.println call to help with tracing, evaluating data values or inspecting request parameters.
