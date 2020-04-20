// Minimum node version check
if (parseInt(process.version.split('.')[0].slice(1)) < 12) {
  console.error('Node.js version 12 or later is required');
  console.error(`You are running ${process.version}`);
  process.exit(1);
}

// Configure babel to handle class properties and JSX
require('@babel/register')({ 
  plugins: [
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ],
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {targets: {node: true}}]
  ]
});

// Log unhadled exceptions in promises
process.on('unhandledRejection', (reason, promise) => {
  if (reason.stack) {
    console.log(reason.stack)
  } else {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason)
  }
});

// Start the server
require('./server/index.js');
