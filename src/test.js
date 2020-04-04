require('@babel/register')({
  plugins: [
    // '@babel/plugin-proposal-numeric-separator',
  ],
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {targets: {node: true}}]
  ]
});

process.on('unhandledRejection', (reason, promise) => {
  if (reason.stack) {
    console.log(reason.stack)
  } else {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason)
  }
});

require('./server/test.js');
