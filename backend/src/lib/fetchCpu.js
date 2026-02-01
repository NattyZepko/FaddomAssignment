const {
	CloudWatchClient,
	GetMetricStatisticsCommand,
} = require('@aws-sdk/client-cloudwatch');

const { resolveInstanceIdByIp } = require('./resolveInstance');

function withStatusCode(message, statusCode) {
	const err = new Error(message);
	err.statusCode = statusCode;
	return err;
}

async function fetchCpuUtilization({ startTime, endTime, periodSeconds }) {
	const region = String(process.env.AWS_REGION || '').trim();
	if (!region) {
		throw withStatusCode('Server misconfigured: missing AWS_REGION', 500);
	}

	const ip = String(process.env.INSTANCE_IP || '').trim();
	if (!ip) {
		throw withStatusCode('Server misconfigured: missing INSTANCE_IP', 400);
	}

	const instanceId = await resolveInstanceIdByIp({ ip, region });
	if (!instanceId) {
		throw withStatusCode(`No EC2 instance found for IP ${ip}`, 404);
	}

	const client = new CloudWatchClient({ region });

	// Get the data from CloudWatch
	const resp = await client.send(
		new GetMetricStatisticsCommand({
			Namespace: 'AWS/EC2',
			MetricName: 'CPUUtilization',
			Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
			StartTime: startTime,
			EndTime: endTime,
			Period: periodSeconds,
			Statistics: ['Average'],
			Unit: 'Percent',
		}),
	);

	// Transform the data into the desired format (value/timestamp pairs)
	const points = (resp.Datapoints || [])
		.filter((d) => d.Timestamp)
		.map((d) => ({
			t: d.Timestamp.toISOString(),
			v: typeof d.Average === 'number' ? d.Average : null,
		}))
		.filter((p) => p.v !== null)
		.sort((a, b) => new Date(a.t) - new Date(b.t));

	return { instanceId, region, ip, points };
}

module.exports = { fetchCpuUtilization };
