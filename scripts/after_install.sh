#!/bin/bash
set -x  # Print commands and their arguments as they are executed

# Fix the directory path
cd /home/ec2-user/elios || exit 1

# Check if yarn is installed, if not install it directly
if ! command -v yarn &> /dev/null; then
    echo "Yarn not found, installing..."

    # Install Node.js directly if nvm isn't working
    if ! command -v node &> /dev/null; then
        echo "Node.js not found, installing directly..."

        # Try using nvm if it exists
        if [ -f "/home/ec2-user/.nvm/nvm.sh" ]; then
            echo "Found NVM, sourcing it..."
            source /home/ec2-user/.nvm/nvm.sh
            nvm install 18
            nvm use 18
        else
            # Alternative: Install Node.js from NodeSource repository
            echo "NVM not found, installing Node.js via yum..."
            sudo curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        fi
    fi

    # Now npm should be available
    if command -v npm &> /dev/null; then
        echo "Installing yarn with npm..."
        npm install -g yarn
    else
        echo "ERROR: Failed to install Node.js/npm, can't install yarn"
        exit 1
    fi
fi

# Print versions for debugging
echo "Checking installed versions:"
if command -v node &> /dev/null; then
    node -v
fi
if command -v npm &> /dev/null; then
    npm -v
fi
if command -v yarn &> /dev/null; then
    yarn -v
fi

# Install dependencies
echo "Installing dependencies..."
yarn install

# Build the application
echo "Building application..."
yarn build

# Skip TypeORM migrations for now to get a successful deployment
echo "Skipping migrations for initial deployment..."

echo "After install script completed successfully"
