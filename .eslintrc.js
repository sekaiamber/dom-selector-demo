module.exports = {
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
    'comma-dangle': 0,
    '@typescript-eslint/space-before-function-paren': 0,
    'multiline-ternary': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
  },
}
