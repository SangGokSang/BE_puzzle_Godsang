#!/bin/bash
cd /home/ubuntu/dm2023-nest-app || exit

sudo docker kill nginx
sudo docker kill dm2023-nest-app
sudo docker-compose up -d