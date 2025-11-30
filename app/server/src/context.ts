import { PrismaClient } from '../../prisma/client.js';
import { Config, loadConfig } from './config/config.js';

export class ServerContext {
	public readonly config: Config;
	public readonly prisma: PrismaClient;

	constructor(config: Config) {
		this.config = config;
		this.prisma = new PrismaClient();
	}

	async close(): Promise<void> {
		await this.prisma.$disconnect();
	}
}

export const GLOBAL = new ServerContext(loadConfig());
export const PRISMA = GLOBAL.prisma;
