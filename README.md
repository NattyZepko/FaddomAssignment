# Faddom Assignment

Node.js backend + React frontend that charts EC2 CPU utilization over time.

<img width="1603" height="855" alt="image" src="https://github.com/user-attachments/assets/7030a97c-9e47-40a6-99e5-999a857b9d3e" />

## Technologies & Libraries

Backend:

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![dotenv](https://img.shields.io/badge/dotenv-env-0EAD69?logo=dotenv&logoColor=white)](https://www.npmjs.com/package/dotenv)
[![CORS](https://img.shields.io/badge/cors-middleware-2C2D72?logo=npm&logoColor=white)](https://www.npmjs.com/package/cors)
[![AWS SDK v3](https://img.shields.io/badge/AWS%20SDK-v3-FF9900?logo=amazonaws&logoColor=white)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
[![EC2 Client](https://img.shields.io/badge/AWS-EC2%20Client-FF9900?logo=amazonec2&logoColor=white)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/)
[![CloudWatch Client](https://img.shields.io/badge/AWS-CloudWatch%20Client-FF9900?logo=amazoncloudwatch&logoColor=white)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch/)

Frontend:

[![React](https://img.shields.io/badge/React-UI-61DAFB?logo=react&logoColor=000000)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Dev%20Server-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Charts-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/docs/latest/)
[![react-chartjs-2](https://img.shields.io/badge/react--chartjs--2-Wrapper-2A145A?logo=react&logoColor=white)](https://react-chartjs-2.js.org/)

## Key Files (GitHub links)

Backend:

- API server + routes: https://github.com/NattyZepko/FaddomAssignment/blob/main/backend/src/index.js
- Resolve instance ID by IP: https://github.com/NattyZepko/FaddomAssignment/blob/main/backend/src/lib/resolveInstance.js
- Get the CPU metrics from CloudWatch: https://github.com/NattyZepko/FaddomAssignment/blob/main/backend/src/lib/fetchCpu.js

Frontend:

- App UI + chart: https://github.com/NattyZepko/FaddomAssignment/blob/main/frontend/src/App.jsx
- React entry point: https://github.com/NattyZepko/FaddomAssignment/blob/main/frontend/src/main.jsx

Config:

- Environment template: https://github.com/NattyZepko/FaddomAssignment/blob/main/.env.example

## References

- Chart.js Line Chart docs (used for dataset/options configuration): https://www.chartjs.org/docs/latest/charts/line.html

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

- Time range (minutes)
- Sampling interval (seconds, multiple of 60)

The backend uses EC2 APIs to resolve the instance by IP, then queries CloudWatch `CPUUtilization`.
