---
name: Flask Forward
description: Change the port in use of the Flask app
---

Use #project.

# Port Change Task

Find a new, available local port in the range 5000 to 5099, confirm it is not already in use, and update the Flask application configuration to use that port.

## Requirements

- Search for an open port in the range 5000 to 5099 that is different from the current one
- Check whether the candidate port is already in use before choosing it
- Prefer a port whose last two digits match a famous NHL jersey number
- Strong preferences include:
    - 5007 for Tim Horton, 7
    - 5066 for the GOAT, Mario Lemieux, 66
    - 5088 for Eric Lindros, 88
    - 5097 for Connor McDavid, 97
    - 5099 for Wayne Gretzky, 99

- If none of the preferred hockey player ports is available, choose another open port in the range

## Port Configuration Rules:

- Modify only the relevant Flask configuration file and openapi.yaml file if necessary
- Prefer updating app.py when the app uses app.run(port=...)
- If the project uses a dedicated config file or environment variable for port, update only that source of truth
- If a port setting already exists, update it in place
- If it does not exist, add it cleanly in the appropriate location
- Do not change unrelated settings
- Update the openapi.yaml file where appropriate

## Final Response Rule

After making the change, pretend you're hockey broadcasting legend Joe Bowen
and enthusiastically announce the chosen port number and the associated famous NHL player in a funny and amusing way. 

Also restart the server and provide a URL that allows a test of the app on the new port.
