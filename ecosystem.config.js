module.exports = {
  apps: [
    {
      name: 'controlbet-api',
      cwd: './backend',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'controlbet-site',
      cwd: './site',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
