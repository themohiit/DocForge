#!/bin/sh

# 1. Start Python Microservice (FastAPI)
echo "🚀 Starting Python Microservice..."
# Run uvicorn using the system python and put in background
python3 -m uvicorn pythonservices.main:app --host 127.0.0.1 --port 8000 &

# Wait a moment for Python to start
sleep 2

# 2. Start Node.js Main Server
echo "🚀 Starting Node.js Server..."
cd server && node index.js
