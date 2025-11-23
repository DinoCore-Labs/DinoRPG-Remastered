import buildServer from './server.js';

const server = buildServer();

async function main() {
	try {
		await server.listen({
			port: 8081,
			host: '0.0.0.0'
		});
		console.log(`Server ready at http://localhost:8081`);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}

main();
