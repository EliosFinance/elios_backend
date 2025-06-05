#!/bin/bash
set -x  # Print commands and their arguments as they are executed

# Check if the directory exists before trying to cd
if [ ! -d "/home/ec2-user/elios" ]; then
    echo "Directory /home/ec2-user/elios doesn't exist yet, nothing to stop"
    exit 0
fi

cd /home/ec2-user/elios || exit 0  # Exit gracefully if we can't cd

# Stop the application if docker-compose.yml exists
if [ -f "docker-compose.prod.yml" ]; then
    echo "Stopping containers..."

    # Check if docker-compose exists and is executable
    if command -v docker-compose &> /dev/null; then
        docker-compose down || echo "Warning: docker-compose down failed"
    elif [ -f "/usr/local/bin/docker-compose" ]; then
        /usr/local/bin/docker-compose down || echo "Warning: docker-compose down failed"
    else
        echo "Warning: Docker Compose not found"
    fi
else
    echo "No docker-compose.prod.yml found, nothing to stop"
fi

echo "Application stop script completed"
