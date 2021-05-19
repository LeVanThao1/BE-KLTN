module.exports = {
    apps: [
        {
            script: 'index.js',
            watch: '.',
            watch: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            script: './service-worker/',
            watch: ['./service-worker'],
        },
    ],

    deploy: {
        production: {
            user: 'thaolv',
            host: '14.185.69.14',
            ref: 'origin/pm2',
            repo: 'https://github.com/LeVanThao1/BE-KLTN',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy':
                'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
        },
    },
};
