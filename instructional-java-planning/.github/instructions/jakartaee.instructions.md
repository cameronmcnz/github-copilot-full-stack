---
applyTo: "src/main/java/**/*.java"
---

# Jakarta EE instructions

Take an 'Eclipse Microprofile first' approach to server-side enterprise applications, with a preference towards Jakarta EE APIs.

For web development, use simple, client-side HTML and JavaScript. Avoid JSPs, Servlets, Faces and SSR for the UI.

# RESTful API Creation and Design Best Practices

Prefer JAX-RS for REST endpoints.

Always include Swagger OpenAPI support for manual API calls and exploration.

Always add Eclipse MicroProfile Health and Eclipse MicroProfile Metrics and use these to implement /health/live and /health/ready endpoints for API health checks.

## H2 Database Setup, Configuration and Troubleshooting

Prefer H2 as the local database for development and testing.

Use the 'H2 Database Setup, Configuration and Troubleshooting' skill to help configure, troubleshoot and debug the H2 database and its integration with Open Liberty.

## Setup and Configure Open Liberty for App Deployment

Always default to Open Liberty as the server for application deployment and hosting.

Configure the project so the Liberty runtime is managed by Maven.

Use the 'Setup and Configure Open Liberty' skill to help configure, deploy to, troubleshoot and debug the Open Liberty server.