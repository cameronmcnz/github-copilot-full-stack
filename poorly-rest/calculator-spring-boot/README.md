

cd c:\_vscode\poorly-rest\calculator-express
npm install
npm run dev

cd c:\_vscode\poorly-rest\calculator-flask
py -m pip install -r [requirements.txt](http://_vscodecontentref_/0)
py [app.py](http://_vscodecontentref_/1)

cd c:\_vscode\poorly-rest\calculator-spring-boot
mvn spring-boot:run

cd c:\_vscode\poorly-rest\calculator-ui
npm install
npm start


## Prompt

Based on the content of the openapi.yaml file, create three separate REST API implementation projects named:

- claculator-fastify, which will be a fully TypeScript/Fastify implementation of the REST API contract defined in the yaml file
- claculator-micronaut, which will be a fully Java based, Micronaut implementation of the REST API contract defined in the yaml file
- claculator-fastapi, which will be a fully Python based, fastapi implementation of the REST API contract defined in the yaml file

Put simple print statements in every method created so we can trace when a method is invoked, along with its parameters.
Do not use any custom logging frameworks, just simply console or print statements, or the equivalent for the language.
Make sure each server runs on a unique port.

Ensure all of the projects build without errors, start each project, and then provide me with the URL on which to test the add method of each implementation.

When complete, update the openapi.yaml file accordingly.



## Prompt

In the root of this project I want you to create a new file named openapi.yaml, which will take a contract first approach to RESTful API design.

Keep the configuration simple, and include all of the required information within this single yaml file.
Within the fine, define the REST API contract for a basic calculator with the four or five main functions of a basic calculator.

Methods only need to handle two parameters at a time. There's no need to take in multiple arguments.

Can you update the sync-ui-on-stop hook. The changes are not being rendered on the website, and I wonder if the Angular application needs to be rebuilt and then redeployed, as the port changes are not being incorporated. Can you update the hook so it works properly and redeploys a rebuilt application that uses the updated ports as defined in the openapi.yaml file. Also, the Angular application displays on the page the ports in use. Can you update the Angular application so that it also updates the landing page to display the new ports and not just the old ones.


# Flask-Forward

Copilot, create a new GitHub Copilot prompt file named Express Port Hops that follows the pattern and idea of the Flask Forward GitHub Copilot Prompt. For the Express JS port configuration prompt, use ports in the range of 3000 to 3099, and ensure the prompt only configures ExpressJS resources, and possibly the OpenAPI Yaml file.


Copilot, create a new GitHub Copilot prompt file named Port Authority that follows the pattern and idea of the Flask Forward GitHub Copilot Prompt. For the Port Authority github copilot prompt, use ports in the range of 8000 to 8099, and ensure the prompt only configures Spring Boot resources, namely application.properties, and possibly the OpenAPI.yaml file.


The calculator-ui angular depends on the specific ports of the ExpressJS, Spring Boot and Flask apps, but the ports of those APIs often change when various prompts are issued.

To address this, I need you to create a new GitHub Copilot Hook (Not GitHub Actions) that runs when a Session ends that will update the calculator-ui angular app to use the most recent rendition of REST API Ports.

Please create this GitHub Copilot hook so the ports used by the calculator-ui app is updated on any session stop event.

Also ensure the Angular App displays the correct ports being used on its landing page.

After the calculator-ui app updated, rebuild the whole calculator-ui project and then redeploy and restart the server so the rebuilt Angular application and updated changes are live.




I can also make the hook restart a production static server instead of ng serve, if your intended “redeploy” flow is meant to serve the built dist output rather than restart the dev server.

Use #project.

Task:

Find a new, available local port in the range 5000 to 5099, confirm it is not already in use, and update the Flask application configuration to use that port.

Requirements:

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

Configuration rules:

- Modify only the relevant Flask configuration file and openapi.yaml file if necessary
- Prefer updating app.py when the app uses app.run(port=...)
- If the project uses a dedicated config file or environment variable for port, update only that source of truth
- If a port setting already exists, update it in place
- If it does not exist, add it cleanly in the appropriate location
- Do not change unrelated settings
- Update the openapi.yaml file where appropriate

Final response rules:

After making the change, pretend you're hockey broadcasting legend Joe Bowen
and enthusiastically announce the chosen port number and the associated famous NHL player
in a funny and amusing way. 

Also run the server and provide a URL that allows a test of the app on the new port.


## Beachcombers Prompt

---
agent: agent
name: logging
description: Set, update, or reset Flask console logging format in calculator-flask/app.py
argument-hint: mode=<go|reset> format=<python logging format string>
---

# Logging Prompt (Flask)

Always work only on `#file:app.py`.

Inputs:
- `${input:mode}`: `go` (default) or `reset`
- `${input:format}`: optional Python logging format string

If `${input:mode}` is `reset`:
- Remove only the logging configuration that was added by this prompt
- Restore default Flask/Python logging behavior as much as possible
- Do not change anything else

If `${input:mode}` is anything else or blank:
- In `#file:app.py`, configure Python logging for console output
- Use this format string:
  - `${input:format}` if provided
  - Otherwise default to: `%(asctime)s | %(levelname)-8s | %(module)s | %(filename)s:%(lineno)d | %(message)s`
- Use the time format: `%H:%M:%S`
- Keep the change minimal
- Prefer standard Python `logging` configuration
- If logging configuration already exists, update it rather than duplicating it
- Do not refactor unrelated code

Rules:
- Only modify `#file:app.py`
- Keep the change minimal
- After editing, briefly state whether logging was set or reset and include the active format if set