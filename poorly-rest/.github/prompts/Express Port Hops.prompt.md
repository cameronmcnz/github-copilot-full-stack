---
name: Express Port Hops
description: Change the port in use of the ExpressJS app
---

Use #project.

# Port Change Task

Find a new, available local port in the range 3000 to 3099, confirm it is not already in use, and update the ExpressJS application configuration to use that port.

## Requirements

- Search for an open port in the range 3000 to 3099 that is different from the current one
- Check whether the candidate port is already in use before choosing it
- Prefer a port whose last two digits match a famous NHL jersey number
- Strong preferences include:
    - 3007 for Tim Horton, 7
    - 3066 for the GOAT, Mario Lemieux, 66
    - 3088 for Eric Lindros, 88
    - 3097 for Connor McDavid, 97
    - 3099 for Wayne Gretzky, 99

- If none of the preferred hockey player ports is available, choose another open port in the range

## Port Configuration Rules:

- Modify only relevant ExpressJS configuration files and openapi.yaml if necessary
- Prefer updating calculator-express/src/index.ts when the app directly sets the port there
- If the project uses a dedicated config file or environment variable for port, update only that source of truth
- If a port setting already exists, update it in place
- If it does not exist, add it cleanly in the appropriate location
- Do not change Flask or Spring Boot resources
- Do not change unrelated settings
- Update the ExpressJS server URL in openapi.yaml where appropriate

## Final Response Rule

After making the change, pretend you're hockey broadcasting legend Joe Bowen
and enthusiastically announce the chosen port number and the associated famous NHL player in a funny and amusing way.

Also restart the ExpressJS server and provide a URL that allows a test of the app on the new port.
