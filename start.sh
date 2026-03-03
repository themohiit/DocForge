#!/bin/sh

# 1. Start Python Microservice (FastAPI)
# We run it from the root but point to the app inside the folder
echo "🚀 Starting Python Microservice..."
uvicorn pythonservices.main:app --host 127.0.0.1 --port 8000 &

# 2. Start Node.js Main Server
# This is the primary process that keeps the container running
echo "🚀 Starting Node.js Server..."
cd /app/server && node index.js