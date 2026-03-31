# Rock Paper Scissors Enterprise Web Application

Create a **fully functional, browser-based Rock Paper Scissors full-stack web application** using a **mainstream enterprise framework** that is:

- widely used in industry
- easy to hire for
- based on **convention over configuration**
- simple to deploy on a server
- supportive of **REST APIs**
- supportive of **inversion of control**
- production-ready with **health endpoints**

## Architectural Requirements

Structure the application as a **layered enterprise application** with:

### Web Tier
Responsible for rendering a browser-based UI.

### REST API Tier
Serves endpoints that the rendered web tier communicates with.

### Service Layer
Contains the Rock Paper Scissors game rules and business logic.

### Persistence Layer
Stores player history and match results.

## Project Deliverable

Build this as a **complete VS Code-ready project** including:

- all source files
- templates
- configuration
- build files

## Functional Requirements

The application must support the following:

- A user can play Rock Paper Scissors as a **best 2 out of 3** match.
- The application assigns each user a **unique ID** and stores it on the client using a **durable cookie**.
- The server uses that ID to associate the user with:
  - match history
  - in-progress game state
- Display the id of the user in the bottom-right corner of the webpage to help with debugging
- No login or registration is required.
- A user can start a new match at any time.
- A user can view current match progress, including:
  - round number
  - score
  - choices made
  - whether the match is complete
- A user can view a **history page** showing previous matches with:
  - timestamps
  - outcomes
  - round-by-round details
- A user can click into a past match and see full details.
- If the browser is refreshed during an active match, the match should continue correctly.
- The computer opponent should make a **random move** each round.

## Web and API Requirements

- Use **HTML, JavaScript, and CSS** for the UI.
- The web pages must call the application’s **REST endpoints** instead of duplicating business logic directly in templates.
- Expose REST endpoints for:
  - starting a match
  - submitting a move
  - getting current match state
  - listing match history
  - viewing match details
- Add support for exploring and testing the REST API.
- Add **live** and **ready** health endpoints.

## Persistence Requirements

- Persist **users**, **matches**, and **rounds** in a database.
- Use a **simple database** for local development.
- Design entities and relationships clearly so match history can be queried easily.

## User Experience Requirements

- Use **soft gradients**, **rounded cards**, and a polished visual style with a **slightly feminine feel**.
- Show friendly status messaging such as:
  - round winner
  - current score
  - final result
- Make the UI **clean, modern, and responsive**.
- Include a home page with tabs such as:
  - **Play**
  - **History**
  - **Match Detail**
  - **Troubleshooting**

## Game Design Improvements

- Show animated feedback or visual emphasis when a round is:
  - won
  - lost
  - tied
- Show the player’s move and the computer’s move with **icons or emoji**.
- Include a clear match summary after the **best 2 out of 3** completes.
- Prevent extra rounds from being played after the match is over.
- Allow the user to immediately begin another match from the summary screen.
- The user competes against the computer or the server

## Completion Requirement

Create **all code, templates and configuration** needed for the application to run.

When finished, start the server and provide me the URL to use to access the application.
