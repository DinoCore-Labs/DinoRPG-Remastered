import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint-define-config';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';
import vueParser from 'vue-eslint-parser';

export default defineConfig([
	/* -------------------------------------------------------------------------- */
	/*                           IGNORE BUILD + NODE                              */
	/* -------------------------------------------------------------------------- */
	{
		ignores: ['**/dist/**', 'dist/**', '**/node_modules/**', 'node_modules/**']
	},
	/* -------------------------------------------------------------------------- */
	/*                        CONFIG CORE + SERVER (TS/MTS)                       */
	/* -------------------------------------------------------------------------- */
	// TS / JS (typed linting)
	{
		files: ['**/*.{ts,tsx,js,mts}'],
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
	/* -------------------------------------------------------------------------- */
	/*                         CONFIG CLIENT (Vue + TS)                           */
	/* -------------------------------------------------------------------------- */
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
