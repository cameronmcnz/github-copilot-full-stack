# Rock Paper Scissors Enterprise (Django)

Layered full-stack Django web app with REST APIs, service layer, and SQLite persistence.

## Stack

- Django (web framework)
- Django REST Framework (REST API)
- drf-spectacular (OpenAPI + Swagger UI)
- SQLite (local development database)

## Layers

- Web tier: server-rendered page in `templates/index.html` with static JS/CSS
- REST API tier: endpoints in `game/api_views.py`
- Service layer: game business logic in `game/services.py`
- Persistence layer: entities in `game/models.py`

## Setup

1. Install dependencies:

   pip install -r requirements.txt

2. Run migrations:

   python manage.py makemigrations
   python manage.py migrate

3. Start server:

   python manage.py runserver

4. Open:

- App: http://127.0.0.1:8000/
- API docs: http://127.0.0.1:8000/api/docs/
- Liveness: http://127.0.0.1:8000/health/live
- Readiness: http://127.0.0.1:8000/health/ready

## API Endpoints

- POST `/api/matches/start`
- POST `/api/matches/current/move`
- GET `/api/matches/current`
- GET `/api/matches/history`
- GET `/api/matches/{match_id}`