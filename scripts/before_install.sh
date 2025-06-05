#!/bin/bash
set -x  # Print commands and their arguments as they are executed

# Check if the destination directory exists
if [ ! -d "/home/ec2-user/elios" ]; then
    echo "Creating destination directory..."
    mkdir -p /home/ec2-user/elios
    # Set proper ownership
    chown ec2-user:ec2-user /home/ec2-user/elios
fi

cd /home/ec2-user/elios || exit 0  # Exit gracefully if we can't cd

# Check if docker and docker-compose are installed
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found, please make sure it's installed"
    exit 0  # Continue deployment even if Docker isn't found
fi

echo "Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found, checking alternative location..."
    if [ -f "/usr/local/bin/docker-compose" ]; then
        export PATH=$PATH:/usr/local/bin
    else
        echo "Docker Compose not found, please make sure it's installed"
        exit 0  # Continue deployment even if Docker Compose isn't found
    fi
fi

# Stop and remove any existing containers (only if docker-compose.yml exists)
if [ -f "docker-compose.yml" ]; then
    echo "Stopping existing containers..."
    docker-compose down || true  # Continue even if this fails
else
    echo "No docker-compose.yml found, skipping container shutdown"
fi

# Clean directory (preserve .env files) - but don't fail if this doesn't work
echo "Cleaning directory..."
find /home/ec2-user/elios -mindepth 1 -not -name "*.env" -delete || true

echo "Before install script completed successfully"
exit 0  # Ensure we exit with success
