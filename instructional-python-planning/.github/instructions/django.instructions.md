---
applyTo: "**/*.py"
---

# Django instructions

Use Django as the default Python web framework.

Use SQLite for local development and testing. 

For any first-touch or initialization SQLite write, always use an idempotent atomic create pattern instead of the find-then-insert approach.

Prefer Django's built-in features before adding third-party packages.

Keep models, views, URLs, and templates simple and easy to follow.

For small APIs, simple JSON responses are fine.

Favor lightweight, well-documented, dependency-free examples that run easily with:
- pip install
- python manage.py migrate
- python manage.py runserver