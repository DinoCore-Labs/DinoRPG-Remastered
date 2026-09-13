import type { FastifyInstance } from 'fastify';

let server: FastifyInstance | undefined;

async function shutdown(): Promise<void> {
	if (server) {
		await server.close();
	}

	process.exit(0);
}

async function main(): Promise<void> {
	const { default: buildServer } = await import('../src/server.js');
	server = await buildServer({
		startBackgroundJobs: false
	});
	const port = Number(process.env.PORT ?? 8081);
	const host = process.env.HOST ?? '127.0.0.1';
	await server.listen({
		port,
		host
	});
}

process.on('SIGINT', () => {
	void shutdown();
});

process.on('SIGTERM', () => {
	void shutdown();
});

void main();
