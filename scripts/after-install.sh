#!/bin/sh

cd /home/ubuntu/dm2023-nest

# test
sudo docker stop dm2023-nest
sudo docker rm dm2023-nest

sudo docker build -t dm2023-nest .
sudo docker run -d -p 80:3000 --name dm2023-nest dm2023-nest