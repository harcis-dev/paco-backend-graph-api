#!/bin/bash

# delete old image
docker rm graph-api
docker rmi graph-api

# build new image
cd ../ && docker build --tag graph-api .