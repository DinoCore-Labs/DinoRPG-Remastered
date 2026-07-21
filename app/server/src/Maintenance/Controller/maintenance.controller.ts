import { prisma } from '../../prisma.js';

const MAINTENANCE_MODE_KEY = 'maintenance.enabled';

export async function getMaintenanceMode() {
	const secret = await prisma.secret.findUnique({
		where: {
			key: MAINTENANCE_MODE_KEY
		}
	});
	return {
		enabled: secret?.value === 'true'
	};
}

export async function setMaintenanceMode(enabled: boolean) {
	const secret = await prisma.secret.upsert({
		where: {
			key: MAINTENANCE_MODE_KEY
		},
		update: {
			value: String(enabled)
		},
		create: {
			key: MAINTENANCE_MODE_KEY,
			value: String(enabled)
		}
	});
	return {
		enabled: secret.value === 'true'
	};
}
