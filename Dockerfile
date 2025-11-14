# Use a robust Node base image that includes tools needed for development
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy the entire monorepo into the container
# This includes all source code, package.json files, and your shared-types directory.
# Ensure you have a .dockerignore file to exclude unnecessary files like .git and local node_modules
COPY . /app

# Install all dependencies (dev and production)
# This is required to get 'tsx', 'typescript', and all package dependencies installed.
# 'npm install' at the root will place dependencies in the correct monorepo node_modules directories.
RUN npm install

# Expose the port your Express app listens on (3000)
EXPOSE 3000

# Set the command to run the backend using the 'dev' script.
# This script uses 'tsx watch' for hot-reloading, monitoring the files copied into the container.
# The expressJs backend listens on port 3000 by convention.
# CMD ["npm", "run", "dev", "--workspace=apps/backend"]
