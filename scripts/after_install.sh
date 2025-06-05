#!/bin/bash
cd /home/ec2-user/elios_backend

yarn install

yarn build

if [ ! -d "src/migrations" ]; then
  mkdir -p src/migrations
  yarn typeorm migration:generate -n InitialMigration
fi

yarn typeorm migration:run
