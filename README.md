# paco-backend-graph-api

Create and configurate the .env-File:

```
# .env
MONGO_ROOT_USER=user
MONGO_ROOT_PASSWORD=password 
MONGODB_PORT=27017  # default MongoDB-Port
# For local hosting choose:                127.0.0.1
# For hosting inside the docker container: host.docker.internal
MONGODB_DOMAIN=127.0.0.1
SERVER_PORT=port
```
Build and run the Dockercontainer with `docker-build.sh` and `docker-run.sh` found in `scripts/`

For local hosting run `npm run dev`
