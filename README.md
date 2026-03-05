<img width="1354" height="650" alt="image" src="https://github.com/user-attachments/assets/92ce43f4-8cd5-4c62-99d1-6dc697a30f5a" />


🚀 DocForge
DocForge is a high-performance, full-stack PDF productivity suite. It combines a sleek, modern React frontend with a powerful hybrid backend (Node.js + Python) to offer professional-grade PDF editing, compression, and conversion tools—all within a single, streamlined interface.

✨ Key Features
Advanced PDF Editor: Overlay text, erase content (white-out), and customize typography (Bold, Italic, Underline) with real-time local previews.

Pro-Grade Compression: Leverages Ghostscript via a Python microservice to significantly reduce file sizes without sacrificing essential quality.

PDF Merging & Tools: Seamlessly combine multiple PDF documents into a single file.

Authentication & Security: Secure user management and protected routes powered by Clerk.

Responsive Design: Fully optimized for mobile and desktop with a premium "Glassmorphism" dark-theme UI.

Support the Creator: Integrated Razorpay support for "Buy Me a Coffee" donations.

🛠️ Tech Stack
Frontend
Framework: React (Vite) + TypeScript

Styling: Tailwind CSS + Shadcn UI

Icons: Lucide React

PDF Rendering: PDF.js & pdf-lib

Backend
Primary Server: Node.js (Express) — Orchestration & Auth

Microservice: Python (FastAPI) — Heavy-duty PDF processing

Engine: Ghostscript (System-level binary)

Deployment & Auth
Auth: Clerk

Payments: Razorpay

Infrastructure: Docker (Mono-container setup)

Hosting: Render

🏗️ Project Structure
Plaintext
DocForge/
├── server/                # Node.js Main Server (Express)
├── pythonservices/        # Python Microservice (FastAPI + Ghostscript)
├── src/                   # React Frontend (Vite)
├── Dockerfile             # Unified Mono-Docker configuration
├── start.sh               # Process manager for dual-service execution
└── docker-compose.yml     # Local development orchestration
🚀 Getting Started
Prerequisites
Docker & Docker Compose

Clerk API Keys

Node.js 20+ (for local development)

Local Setup (Docker)
Clone the repository:

Bash
git clone https://github.com/themohiit/DocForge.git
cd DocForge
Configure Environment Variables:
Create a .env file in the root:

Code snippet
VITE_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
PORT=3000
Build and Run:

Bash
docker-compose up --build
Your app will be live at http://localhost:3000.

🚢 Deployment (Render)
This project is designed to run on a single Render "Web Service" using Docker to save costs while maintaining high performance.

Create a new Web Service on Render.

Connect your GitHub repository.

Choose Docker as the runtime.

Add your environment variables in the Render Dashboard.

Render will automatically use the Dockerfile and start.sh to launch both the Node.js and Python servers simultaneously.

☕ Support the Project
If you find DocForge helpful, consider supporting the development!

Buy Me a Coffee (Razorpay)

📄 License
Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ by Mohit
