#!/bin/bash
set -e
set -x

cd /home/ec2-user/elios_backend

if ! command -v yarn &> /dev/null; then
  echo "Yarn not found, installing..."

  if ! command -v npm &> /dev/null; then
    echo "npm not found, installing Node.js..."

    export NVM_DIR="/home/ec2-user/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    if ! command -v node &> /dev/null; then
      echo "Node.js not found, installing with NVM..."
      nvm install 18
      nvm use 18
    fi

    npm install -g yarn
  else
    npm install -g yarn
  fi
fi

node -v
npm -v
yarn -v

echo "Installing dependencies..."
yarn install

echo "Building application..."
yarn build

if ! yarn typeorm --version &> /dev/null; then
  echo "Typeorm CLI not working, checking configuration..."
  if ! grep -q "typeorm" package.json; then
    echo "Typeorm not found in package.json, installing..."
    yarn add typeorm
  fi

  if ! grep -q "ts-node" package.json; then
    echo "ts-node not found in package.json, installing..."
    yarn add ts-node tsconfig-paths
  fi
fi

if [ ! -d "src/migrations" ]; then
  echo "Creating migrations directory..."
  mkdir -p src/migrations

  echo "Attempting to generate initial migration..."
  if [ -f "src/migrations/data-source.ts" ]; then
    yarn typeorm migration:generate -n InitialMigration || echo "Migration generation failed, continuing..."
  else
    echo "Warning: data-source.ts not found, skipping migration generation"
  fi
fi

echo "Attempting to run migrations..."
if [ -f "src/database/data-source.ts" ]; then
    yarn typeorm migration:run || echo "Migration run failed, continuing..."
else
    echo "Warning: data-source.ts not found, skipping migrations"
fi

echo "After install script completed"

