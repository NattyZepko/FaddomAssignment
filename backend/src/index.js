const path = require('node:path');
const express = require('express');
const cors = require('cors');

// Prefer a repo-root .env so both backend + frontend share one place.
require('dotenv').config({
	path: path.join(__dirname, '..', '..', '.env'),
});

const { fetchCpuUtilization } = require('./lib/fetchCpu');

const MINUTES = 60 * 1000; // milliseconds

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

// Returns the instance IP the backend is configured to use.
app.get('/api/instance', (_req, res) => {
	res.json({
		ip: String(process.env.INSTANCE_IP || '').trim(),
		region: String(process.env.AWS_REGION || '').trim(),
	});
});

// CPU utilization endpoint (main functionality of the app)
app.get('/api/cpu', async (req, res) => {
	try {
		const rangeMinutes = Number(req.query.rangeMinutes);
		const intervalSeconds = Number(req.query.intervalSeconds);

		if (!Number.isFinite(rangeMinutes) || rangeMinutes <= 0) {
			return res
				.status(400)
				.json({ error: 'Invalid rangeMinutes must be bigger than 0' });
		}
		if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
			return res
				.status(400)
				.json({ error: 'Invalid intervalSeconds must be bigger than 0' });
		}
		if (intervalSeconds % 60 !== 0) {
			return res
				.status(400)
				.json({ error: 'intervalSeconds must be a multiple of 60' });
		}

		const now = new Date();
		const startTime = new Date(now.getTime() - rangeMinutes * MINUTES);

		const { instanceId, region, points } = await fetchCpuUtilization({
			startTime,
			endTime: now,
			periodSeconds: intervalSeconds,
		});

		res.json({
			instanceId,
			region,
			startTime: startTime.toISOString(),
			endTime: now.toISOString(),
			periodSeconds: intervalSeconds,
			points,
		});
	} catch (err) {
		console.error(err);
		const statusCode = Number(err?.statusCode) || 500;
		res.status(statusCode).json({
			error: statusCode === 500 ? 'Unexpected server error' : err.message,
		});
	}
});

// Start the server
const port = Number(process.env.PORT || 5179);
app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`);
});
