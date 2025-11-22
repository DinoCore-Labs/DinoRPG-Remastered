import Fastify from 'fastify';

import { userRoutes } from './routes/user.routes.js';
import { userSchemas } from './schema/user.schema.js';

const app = Fastify({
	logger: true
});

// register schemas
for (let schema of [...userSchemas]) {
	app.addSchema(schema);
}

// routes
app.register(userRoutes, { prefix: 'api/users' });

app.get('/', async () => {
	return { message: 'Hello World!' };
});
app.get('/healthcheck', (req, res) => {
	res.send({ message: 'Success' });
});

// graceful shutdown
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach(signal => {
	process.on(signal, async () => {
		await app.close();
		process.exit(0);
	});
});

async function main() {
	await app.listen({
		port: 8081,
		host: '0.0.0.0'
	});
}
main();
