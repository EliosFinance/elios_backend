#!/bin/bash
# Stop and remove any existing containers
cd /home/ec2-user/elios_backend
if [ -f docker-compose.prod.yml ]; then
  docker-compose down
fi

find /home/ec2-user/elios_backend -mindepth 1 -not -name "*.env" -delete
