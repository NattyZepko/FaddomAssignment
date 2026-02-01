const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');

async function resolveInstanceIdByIp({ ip, region }) {
	const client = new EC2Client({ region });
	const filtersToTry = [
		{ Name: 'ip-address', Values: [ip] },
		{ Name: 'private-ip-address', Values: [ip] },
	];

	for (const filter of filtersToTry) {
		const resp = await client.send(
			new DescribeInstancesCommand({ Filters: [filter] }),
		);

		for (const reservation of resp.Reservations || []) {
			for (const instance of reservation.Instances || []) {
				if (instance.InstanceId) return instance.InstanceId;
			}
		}
	}

	return null;
}

module.exports = { resolveInstanceIdByIp };
