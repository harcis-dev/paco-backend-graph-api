#!/bin/bash

# stop and remove old container
docker rm graph-api

# run new container
docker run -it -p 8080:8080 --name graph-api graph-api