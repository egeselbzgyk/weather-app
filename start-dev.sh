#!/bin/bash

# Start PocketBase in the background
echo "Starting PocketBase..."
cd pocketbase
./pocketbase serve &
POCKETBASE_PID=$!
cd ..

# Wait for PocketBase to start
sleep 3

# Set up PocketBase collections
echo "Setting up PocketBase collections..."
cd pocketbase
npm run setup
cd ..

# Start backend in the background
echo "Starting backend service..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start collector service in the background
echo "Starting collector service..."
cd collector-service
npm run dev &
COLLECTOR_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev

# Cleanup function to kill background processes
cleanup() {
  echo "Stopping services..."
  kill $POCKETBASE_PID
  kill $BACKEND_PID
  kill $COLLECTOR_PID
  exit 0
}

# Register cleanup function to run on script termination
trap cleanup SIGINT SIGTERM

# Wait for frontend to exit
wait 