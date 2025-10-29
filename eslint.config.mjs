import next from 'eslint-config-next';

const config = [
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      '.tools/**/*',
      'reports/**/*',
      'test-results/**/*',
      'scripts/prod-start.sh',
      'backend/**/*',
    ],
  },
  ...next,
];

export default config;
