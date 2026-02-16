#!/bin/bash
echo "Starting VibeClonePro Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "Starting Database..."
docker-compose up -d db

echo "Waiting for Database to be ready..."
sleep 5

echo "Starting NestJS Server..."
npm run start:dev
