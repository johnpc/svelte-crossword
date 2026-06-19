import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'no-undef': 'off',
			'no-empty': 'off',
			'no-case-declarations': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-immutable-reactive-statements': 'off',
			'svelte/no-reactive-literals': 'off',
			'svelte/no-reactive-reassign': 'off',
			'svelte/require-each-key': 'off',
			'svelte/no-at-html-tags': 'off'
		}
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'.amplify/',
			'amplify/',
			'ios/',
			'android/',
			'coverage/',
			'.features-gen/',
			'check-*.ts',
			'cleanup-*.ts',
			'delete-*.ts',
			'direct-*.ts',
			'fetch-*.ts',
			'find-*.ts',
			'full-*.ts',
			'migrate-*.ts',
			'remigrate-*.ts',
			'test-*.ts',
			'scripts/check-dependency-versions.cjs',
			'scripts/direct-rds-migration.ts'
		]
	}
);
