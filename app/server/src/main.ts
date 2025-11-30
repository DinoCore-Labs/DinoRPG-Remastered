import { loadConfig } from './config/config.js';
import buildServer from './server.js';

const cfg = loadConfig();
const server = buildServer();

async function main() {
	try {
		await server.listen({
			port: cfg.port,
			host: '0.0.0.0'
		});
		console.log(`🚀 Server ready at ${cfg.selfUrl.origin.replace(/\/$/, '')}`);
		console.log(`📚 API docs at ${cfg.selfUrl.origin.replace(/\/$/, '')}/docs`);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}

main();
