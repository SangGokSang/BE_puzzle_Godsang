#!/bin/sh

cd /home/ubuntu/dm2023-nest || exit

sudo docker stop dm2023-nest
sudo docker rm dm2023-nest
sudo docker rmi dm2023-nest