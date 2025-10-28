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
    ],
  },
  ...next,
];

export default config;
