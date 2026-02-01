import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	TimeScale,
	Title,
	Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

import './App.css';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale,
);

const METRIC_TITLE = 'CPU Utilization';
const DATASET_LABEL = 'CPU Utilization (%)';

function App() {
	const [rangeMinutes, setRangeMinutes] = useState(60);
	const [intervalSeconds, setIntervalSeconds] = useState(300);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);
	const [instanceIp, setInstanceIp] = useState('');

	useEffect(() => {
		let cancelled = false;
		fetch('/api/instance')
			.then((r) => (r.ok ? r.json() : null))
			.then((json) => {
				if (cancelled || !json) return;
				if (typeof json.ip === 'string') setInstanceIp(json.ip);
			})
			.catch(() => {
				// ignore (backend may not started yet)
			});
		return () => {
			cancelled = true;
		};
	}, []);

	function validateValues() {
		if (!Number.isFinite(rangeMinutes) || rangeMinutes <= 0) {
			setError('Range (minutes) must be > 0');
			return false;
		}
		if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
			setError('Interval (seconds) must be > 0');
			return false;
		}
		if (intervalSeconds % 60 !== 0) {
			setError('Interval must be a multiple of 60 seconds');
			return false;
		}
		return true;
	}

	async function onSubmit(e) {
		e.preventDefault(); // prevent page reload
		setError(''); // remove prior errors (if they exist)
		setResult(null); // clear prior result, if any

		if (!validateValues()) {
			return;
		}

		setLoading(true);
		try {
			const params = new URLSearchParams({
				rangeMinutes: String(rangeMinutes),
				intervalSeconds: String(intervalSeconds),
			});
			const resp = await fetch(`/api/cpu?${params.toString()}`);
			const json = await resp.json().catch(() => null);
			if (!resp.ok) {
				setError(json?.error || 'Request failed');
				return;
			}
			setResult(json);
		} catch {
			setError('Failed to reach backend');
		} finally {
			setLoading(false);
		}
	}

	const chartData = useMemo(() => {
		const points = result?.points || [];
		const labels = points.map((point) =>
			new Date(point.t).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
		);
		return {
			labels,
			datasets: [
				{
					label: DATASET_LABEL,
					data: points.map((point) => point.v),
					borderColor: '#83feb2',
					backgroundColor: '#2a145a',
					tension: 0.35, // How "curvy" the line is
					pointRadius: 4,
					pointHoverRadius: 8,
					pointHitRadius: 10,
				},
			],
		};
	}, [result]);

	const chartOptions = useMemo(
		() => ({
			maintainAspectRatio: false,
			responsive: true,
			plugins: {
				legend: {
					display: true,
					labels: {
						color: '#ddd6fe',
					},
				},
				title: {
					display: true,
					color: '#ede9fe',
					text: result
						? `CPU for ${result.instanceId} IP: (${instanceIp || 'N/A'})`
						: METRIC_TITLE,
				},
				tooltip: {
					callbacks: {
						title: (items) => {
							const idx = items?.[0]?.dataIndex ?? -1;
							const time = result?.points?.[idx]?.t;
							return time ? new Date(time).toLocaleString() : '';
						},
						label: (ctx) => {
							const v = ctx.parsed?.y;
							return typeof v === 'number'
								? `${METRIC_TITLE}: ${v.toFixed(2)}%`
								: METRIC_TITLE;
						},
					},
				},
			},
			scales: {
				x: {
					ticks: {
						color: '#a1a1aa',
						maxRotation: 0,
						autoSkip: true,
						maxTicksLimit: 10,
					},
					grid: {
						color: 'rgba(167, 139, 250, 0.12)',
					},
				},
				y: {
					title: { display: true, text: 'CPU % usage' },
					ticks: {
						color: '#a1a1aa',
						callback: (v) => `${v}`,
					},
					grid: {
						color: 'rgba(167, 139, 250, 0.12)',
					},
					suggestedMin: 0,
					suggestedMax: 1,
				},
			},
		}),
		[result, instanceIp],
	);

	return (
		<div className="page">
			<div className="container">
				<h1>EC2 CPU Usage</h1>
				<p className="muted">
					Get CPU usage <span className="mono">CPUUtilization</span> metrics
					from IP: <code>{instanceIp || 'N/A'}</code>
				</p>

				<form className="form formCard" onSubmit={onSubmit}>
					<label>
						<div className="label">Time range (minutes)</div>
						<input
							type="number"
							min={1}
							step={1}
							value={rangeMinutes}
							onChange={(e) => setRangeMinutes(Number(e.target.value))}
						/>
					</label>

					<label>
						<div className="label">Interval (seconds)</div>
						<input
							type="number"
							min={60}
							step={60}
							value={intervalSeconds}
							onChange={(e) => setIntervalSeconds(Number(e.target.value))}
						/>
					</label>

					<button className="button" type="submit" disabled={loading}>
						{loading ? 'Loading…' : 'Fetch CPU'}
					</button>
				</form>

				{error ? <div className="error">{error}</div> : null}

				{result ? (
					<div className="card">
						<div className="meta">
							<div>
								<div className="k">InstanceId</div>
								<div className="v mono">{result.instanceId}</div>
							</div>
							<div>
								<div className="k">Points</div>
								<div className="v mono">{result.points?.length ?? 0}</div>
							</div>
						</div>

						<div className="chart">
							<Line data={chartData} options={chartOptions} />
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default App;
