const { default: buildServer } = await import('../src/server.js');

const server = await buildServer({
	startBackgroundJobs: false
});

const port = Number(process.env.PORT ?? 8081);
const host = process.env.HOST ?? '127.0.0.1';

await server.listen({
	port,
	host
});

async function shutdown(): Promise<void> {
	await server.close();
	process.exit(0);
}

process.on('SIGINT', () => {
	void shutdown();
});

process.on('SIGTERM', () => {
	void shutdown();
});
