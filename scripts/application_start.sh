#!/bin/bash
set -x  # Print commands and their arguments as they are executed

cd /home/ec2-user/elios_backend || exit 1

# Ensure docker is running
if ! systemctl is-active --quiet docker; then
    echo "Docker is not running, attempting to start..."
    sudo systemctl start docker || true
    sudo systemctl start docker || true
fi

# Create a basic docker-compose.yml if it doesn't exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Creating basic docker-compose.yml..."
    cat > docker-compose.prod.yml << 'EOF'
version: '3.9'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - '3333:3333'
    environment:
      - NODE_ENV=production
    volumes:
      - ./dist:/app/dist
    networks:
      - elios_network

networks:
  elios_network:
    driver: bridge
EOF
fi

# Check if docker-compose exists and is executable
if command -v docker-compose &> /dev/null; then
    echo "Stopping only application services (api, worker)..."
    docker-compose -f docker-compose.prod.yml stop api worker || echo "Warning: Failed to stop some services"

    echo "Starting containers with updated environment..."
    docker-compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans api worker || echo "Warning: docker-compose up failed"

    echo "Ensuring database services are running..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis || echo "Warning: Failed to start database services"

elif [ -f "/usr/local/bin/docker-compose" ]; then
    echo "Stopping only application services (api, worker)..."
    /usr/local/bin/docker-compose -f docker-compose.prod.yml stop api worker || echo "Warning: Failed to stop some services"

    echo "Starting containers with updated environment..."
    /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans api worker || echo "Warning: docker-compose up failed"

    echo "Ensuring database services are running..."
    /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d postgres redis || echo "Warning: Failed to start database services"
else
    echo "WARNING: Docker Compose not found, skipping container startup"
fi

# Configure Nginx
if [ -f "deploy/nginx/elios.conf" ]; then
    echo "Configuring Nginx..."
    sudo cp deploy/nginx/elios.conf /etc/nginx/conf.d/ || echo "Warning: Failed to copy Nginx config"

    # Check if Nginx is installed and running
    if command -v nginx &> /dev/null; then
        echo "Restarting Nginx..."
        sudo systemctl restart nginx || echo "Warning: Failed to restart Nginx"
    else
        echo "Warning: Nginx not found"
    fi
else
    echo "Nginx config file not found"
fi

echo "Application start script completed"
