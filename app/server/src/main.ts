import { loadConfig } from './config/config.js';
import { logServerStart, logServerStop } from './logger/Helpers/logServerLifecycle.js';
import buildServer from './server.js';

const cfg = loadConfig();
const server = await buildServer();

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
	if (isShuttingDown) {
		return;
	}
	isShuttingDown = true;
	await logServerStop({
		env: cfg.env,
		stoppedAt: new Date().toISOString(),
		signal,
		pid: process.pid,
		nodeVersion: process.version
	});
	await server.close();
	process.exit(0);
}
process.on('SIGTERM', signal => {
	void shutdown(signal);
});
process.on('SIGINT', signal => {
	void shutdown(signal);
});

async function main() {
	try {
		await server.listen({
			port: cfg.port,
			host: process.env.HOST ?? '127.0.0.1'
		});
		const startedAt = new Date();
		console.log(`🚀 Server ready at ${cfg.selfUrl.origin.replace(/\/$/, '')}`);
		console.log(`📚 API docs at ${cfg.apiUrl.origin.replace(/\/$/, '')}/docs`);
		logServerStart({
			env: cfg.env,
			startedAt: startedAt.toISOString(),
			nodeEnv: process.env.NODE_ENV ?? null,
			nodeVersion: process.version,
			pid: process.pid,
			host: process.env.HOST ?? '127.0.0.1',
			port: cfg.port,
			apiUrl: cfg.apiUrl.origin,
			selfUrl: cfg.selfUrl.origin
		});
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}

main();
