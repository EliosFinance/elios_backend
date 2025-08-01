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

# IMPORTANT: Arrêter complètement les containers existants
echo "Stopping and removing existing containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans || echo "No existing containers"
elif [ -f "/usr/local/bin/docker-compose" ]; then
    /usr/local/bin/docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans || echo "No existing containers"
fi

# Forcer la reconstruction des images pour s'assurer des nouvelles variables
echo "Rebuilding and starting containers with updated environment..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
elif [ -f "/usr/local/bin/docker-compose" ]; then
    /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
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
