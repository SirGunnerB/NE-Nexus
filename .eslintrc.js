module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:security/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
  },
  overrides: [
    {
      files: ['client/**/*.{js,jsx}'],
      env: {
        browser: true,
      },
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/prop-types': 'warn',
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
}; 