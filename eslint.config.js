// eslint.config.ts
import { defineConfig } from 'eslint-define-config';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default defineConfig([
	// Ignore les dossiers build/dist
	{
		ignores: ['dist/**', 'node_modules/**', '*.config.js']
	},

	// TS / JS (typed linting)
	{
		files: ['**/*.{ts,tsx,js}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			'simple-import-sort': simpleImportSort,
			prettier: prettierPlugin,
			import: importPlugin
		},
		rules: {
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'import/first': 'error',
			'import/named': 'off',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'prettier/prettier': 'error'
		}
	},

	// Vue files (no typed linting)
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser, // for <script lang="ts">
				ecmaVersion: 'latest',
				sourceType: 'module'
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			vue: vuePlugin,
			'simple-import-sort': simpleImportSort,
			prettier: prettierPlugin,
			import: importPlugin
		},
		rules: {
			'import/named': 'off',
			'prettier/prettier': 'error'
		}
	}
]);
