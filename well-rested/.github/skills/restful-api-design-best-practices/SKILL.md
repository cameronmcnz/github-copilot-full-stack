---
name: RESTful API design and creation best practices
description: Use this skill when the user needs to define a REST API contract and implement a RESTful API design
---

# RESTful API design and creation best practices

Use this skill whenever the user asks to "define a REST API contract" or create a "RESTful API design" or anything similar.

## Rules

Use nouns, not verbs when naming endpoints and forming the path.

Do NOT create endpoints or paths like this:

- /add
- /createUser
- /getItems

DO create endpoints and resource based paths by using nouns as the resource names, such as:

- /sum
- /users
- /orders

## Parameter naming

Use clear and descriptive names for query parameters

Good: 
- ?numerator=40&denominator=2

Bad:
- ?a=40&b=2

Don't get too esoteric with the names though. Keep the parameter names familiar and sensible.

## Return simple types directly

When the result is a simple type like:

- int
- double
- String
- boolean

Just return the raw value directly when it's a simple type, not a ResponseBody or JSON or XML or some other type of wrapper.

Also, implement each endpoint in its own method.



























