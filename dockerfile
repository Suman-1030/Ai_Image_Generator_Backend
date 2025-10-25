# Stage 1: Build
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including devDependencies if needed for build)
RUN npm install

# Copy rest of the app
COPY . .

# Stage 2: Runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install minimal dependencies required for Node modules with native bindings
RUN apk add --no-cache python3 make g++

# Copy only built app and node_modules from builder
COPY --from=builder /app ./

# Expose the port your app uses
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
