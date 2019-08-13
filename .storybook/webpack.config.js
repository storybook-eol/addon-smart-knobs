const path = require('path')

module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      'react-docgen-typescript-loader',
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      }
    ],
  });

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
