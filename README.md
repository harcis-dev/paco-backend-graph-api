# paco-backend-graph-api

Configurate the .env-File:

\# Production || Development:
```
# .env
MONGO_ROOT_USER=""
MONGO_ROOT_PASSWORD=""
MONGODB_PORT=27017
# host.docker.internal || 127.0.0.1
MONGODB_DOMAIN=host.docker.internal
SERVER_PORT=8080
# production || development
NODE_ENV=production
```
Build and run the Dockercontainer with `docker-build.sh` and `docker-run.sh` found in `scripts/`

For development run `npm run development`, for production `npm run production`

- API-Calls:

  - Get graph:
    - GET http://localhost:8080/ids

  - Add graph:
    - POST http://localhost:8080/graph
    - Body: 
            ```json
            {
            "_id": "4",
            "generally": {"graph": "a graph"},
            "epk": {"graph": "a lol graph"},
            "bpmn": {"graph": "a graph"}
            }
            ```

  - Read graph:
    - GET http://localhost:8080/graph?id=4
