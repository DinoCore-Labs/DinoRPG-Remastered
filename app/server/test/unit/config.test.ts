import { describe, expect, it } from 'vitest';

import { config, readBoolean, readPort, readUrl, requireSecret } from '../../src/config/config.js';

describe('server config', () => {
	describe('readPort', () => {
		it('uses the provided port', () => {
			expect(readPort('9000', 8081)).toBe(9000);
		});
		it('uses the fallback when the value is invalid', () => {
			expect(readPort('invalid', 8081)).toBe(8081);
		});
		it('uses the fallback when no value exists', () => {
			expect(readPort(undefined, 8081)).toBe(8081);
		});
	});
	describe('readBoolean', () => {
		it('parses true', () => {
			expect(readBoolean('true')).toBe(true);
		});
		it('parses false', () => {
			expect(readBoolean('false')).toBe(false);
		});
		it('returns false for invalid values', () => {
			expect(readBoolean('foo')).toBe(false);
		});
	});
	describe('readUrl', () => {
		it('returns the configured URL', () => {
			expect(readUrl('https://example.com', 'http://localhost').origin).toBe('https://example.com');
		});
		it('falls back when the configured URL is invalid', () => {
			expect(readUrl('not-an-url', 'http://localhost:8080').origin).toBe('http://localhost:8080');
		});
	});
	describe('requireSecret', () => {
		it('uses the development fallback', () => {
			expect(requireSecret('TEST_SECRET', undefined, false, 'development-secret')).toBe('development-secret');
		});
		it('rejects a missing production secret', () => {
			expect(() => requireSecret('TEST_SECRET', undefined, true, 'development-secret')).toThrow();
		});
		it('rejects a production secret shorter than 32 characters', () => {
			expect(() => requireSecret('TEST_SECRET', 'too-short', true, 'development-secret')).toThrow();
		});
	});
	describe('config', () => {
		it('creates a development configuration with defaults', () => {
			const result = config({
				NODE_ENV: 'development'
			});
			expect(result.env).toBe('development');
			expect(result.isProduction).toBe(false);
			expect(result.port).toBe(8081);
			expect(result.apiUrl.origin).toBe('http://localhost:8081');
			expect(result.selfUrl.origin).toBe('http://localhost:8080');
			expect(result.secrets.jwt).toBe('dev_jwt_secret');
		});
	});
});
