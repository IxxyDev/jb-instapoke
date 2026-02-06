export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
  'server/src/**/*.ts': () => 'npm test -w server',
  'client/src/**/*.{ts,tsx}': () => 'npm test -w client',
};