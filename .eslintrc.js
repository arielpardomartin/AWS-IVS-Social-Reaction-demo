export default {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  globals: {
    module: 'writable',
    require: 'readonly',
    process: 'readonly',
    exports: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    'no-unused-vars': ['error', { vars: 'local', args: 'after-used', ignoreRestSiblings: false }],
  },
  ignorePatterns: [
    './.eslintrc.js',
    './node_modules/*',
    './deployment/node_modules/*',
    './serverless/lambda-add-reaction/node_modules/*',
    './serverless/lambda-get-reactions/node_modules/*',
    './serverless/lambda-on-connect/node_modules/*',
    './serverless/lambda-on-disconnect/node_modules/*',
    './serverless/lambda-send-message/node_modules/*',
    './serverless/reactions-server/node_modules/*',
    './web-ui/player-app/node_modules/*',
  ],
};
