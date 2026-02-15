import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import pluginUnusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Generated files
        'lib/api_client/gen/**',
    ]),
    eslintConfigPrettier,
    {
        plugins: {
            prettier: eslintPluginPrettier,
            'unused-imports': pluginUnusedImports,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            // Prettier formatting rules for beautiful JSX
            'prettier/prettier': [
                'warn',
                {
                    endOfLine: 'auto',
                    printWidth: 100,
                    semi: true,
                    singleQuote: true,
                    trailingComma: 'es5',
                    bracketSpacing: true,
                    arrowParens: 'always',
                    jsxSingleQuote: false,
                    bracketSameLine: false,
                    tabWidth: 4,
                },
            ],
            '@typescript-eslint/ban-ts-comment': 'off',
            // Remove unused imports
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
]);

export default eslintConfig;
