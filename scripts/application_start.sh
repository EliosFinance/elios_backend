#!/bin/bash
cd /home/ec2-user/elios_backend

docker-compose -f docker-compose.prod.yml up -d

if [ ! -f /etc/nginx/conf.d/elios.conf ]; then
  sudo cp deploy/nginx/elios.conf /etc/nginx/conf.d/
  sudo systemctl restart nginx
fi
