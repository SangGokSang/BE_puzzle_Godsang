#!/bin/bash
cd /home/ubuntu/dm2023-nest-app

DOCKER_IMAGE_NAME=dm2023-nest-app

DOCKER_CONTAINER_NAME=nest-app

docker build -t ${DOCKER_IMAGE_NAME} ../

docker run -d -p 3000:3000 --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_NAME}