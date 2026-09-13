import { defineConfig, devices } from '@playwright/test';

const inheritedEnvironment = Object.fromEntries(
	Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
);

export default defineConfig({
	testDir: './tests/e2e',

	fullyParallel: true,

	forbidOnly: Boolean(process.env.CI),

	retries: process.env.CI ? 2 : 0,

	workers: process.env.CI ? 1 : undefined,

	reporter: process.env.CI
		? [
				['github'],
				[
					'html',
					{
						open: 'never'
					}
				]
			]
		: [
				['list'],
				[
					'html',
					{
						open: 'never'
					}
				]
			],

	use: {
		baseURL: 'http://127.0.0.1:8080',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome']
			}
		}
	],

	webServer: [
		{
			name: 'API',
			command: 'pnpm --filter @dinorpg/server test:e2e:server',
			url: 'http://127.0.0.1:8081/healthcheck',
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,

			env: {
				...inheritedEnvironment,

				NODE_ENV: 'test',
				HOST: '127.0.0.1',
				PORT: '8081',

				API_URL: 'http://127.0.0.1:8081',
				SELF_URL: 'http://127.0.0.1:8080',

				DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/dinorpg_test'
			}
		},

		{
			name: 'Client',
			command: 'pnpm --filter @dinorpg/client dev',
			url: 'http://127.0.0.1:8080',
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,

			env: {
				...inheritedEnvironment,

				VITE_API_URL: 'http://127.0.0.1:8081'
			}
		}
	]
});
