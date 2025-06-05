#!/bin/bash
cd /home/ec2-user/elios_backend

if [ -f docker-compose.prod.yml ]; then
  docker-compose down
fi
