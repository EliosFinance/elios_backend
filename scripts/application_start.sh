#!/bin/bash
set -x  # Print commands and their arguments as they are executed

cd /home/ec2-user/elios || exit 1

# Ensure docker is running
if ! systemctl is-active --quiet docker; then
    echo "Docker is not running, attempting to start..."
    sudo systemctl start docker || true
fi

# Check if docker-compose exists and is executable
if command -v docker-compose &> /dev/null; then
    echo "Starting containers with docker-compose..."
    docker-compose up -d || echo "Warning: docker-compose up failed"
else
    echo "Docker Compose not found, checking alternative location..."
    if [ -f "/usr/local/bin/docker-compose" ]; then
        echo "Starting containers with /usr/local/bin/docker-compose..."
        /usr/local/bin/docker-compose up -d || echo "Warning: docker-compose up failed"
    else
        echo "ERROR: Docker Compose not found"
        exit 1
    fi
fi

# Configure Nginx
if [ ! -f /etc/nginx/conf.d/elios.conf ] && [ -f "deploy/nginx/elios.conf" ]; then
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
    echo "Nginx already configured or config file not found"
fi

echo "Application start script completed"
