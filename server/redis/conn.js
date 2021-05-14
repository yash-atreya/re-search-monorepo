const {Redisearch} = require('redis-modules-sdk');

const createClient = (host, port, db_index) => {
    console.log('Connecting to host ', host, ':', port);
    const client = new Redisearch({
        host: host,
        port: port,
        db: db_index ? db_index : 0,
        connectTimeout: 20000,
        password: process.env.REDIS_AUTH_KEY,
        enableReadyCheck: true,
    });
    return client;
}

module.exports = createClient;