const Redis = require('ioredis')

const redisClient = new Redis({
    host: '127.0.0.1', // Default local Redis server
    port: 6379,
    retryStrategy(times) {
        // Automatically attempt reconnection if connection drops
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisClient.on('connect', () => {
    console.log('⚡ [Redis]: Connected successfully to memory store.');
});

redisClient.on('error', (err) => {
    console.error('❌ [Redis]: Connection error:', err);
});

module.exports = redisClient