import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/unit/**/*.test.ts'],
		clearMocks: true,
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			reportsDirectory: 'coverage/unit'
		}
	}
});
