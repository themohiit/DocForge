# Start with Python base for Ghostscript compatibility
FROM python:3.11-slim

# Install Node.js, Ghostscript, and Curl
RUN apt-get update && apt-get install -y \
    curl \
    ghostscript \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Setup Python Microservice ---
# Use the correct folder name: pythonservices
COPY pythonservices/requirement.txt ./pythonservices/requirement.txt
RUN pip install --no-cache-dir -r ./pythonservices/requirement.txt

# --- Setup Node.js Main Server ---
COPY server/package*.json ./server/
RUN cd server && npm install --production

# --- Copy All Files ---
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Render uses the PORT env var for the public-facing service (Node.js)
EXPOSE 3000
EXPOSE 8000

CMD ["./start.sh"]