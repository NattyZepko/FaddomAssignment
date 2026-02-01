# Faddom Assignment

Minimal Node.js backend + React frontend that charts EC2 CPU utilization over time.

## Setup

1. Copy the env template and fill values:
   - `copy .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`)

2. Install deps:
   - Backend: `cd backend` then `npm install`
   - Frontend: `cd ../frontend` then `npm install`

## Run

In two terminals:

1. Backend:
   - `cd backend`
   - `npm run dev`

2. Frontend:
   - `cd frontend`
   - `npm run dev`

Open the frontend URL (usually http://localhost:5173) and enter:

- Instance IP
- Time range (minutes)
- Sampling interval (seconds, multiple of 60)

The backend uses EC2 APIs to resolve the instance by IP, then queries CloudWatch `CPUUtilization`.
