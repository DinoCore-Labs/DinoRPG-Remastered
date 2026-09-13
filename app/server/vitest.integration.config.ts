import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/integration/**/*.test.ts'],
		clearMocks: true,
		restoreMocks: true,
		testTimeout: 15_000,
		hookTimeout: 15_000
	}
});
