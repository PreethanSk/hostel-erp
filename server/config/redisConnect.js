const { createClient } = require('redis');

const client = createClient(global.config.redis_database)
 async function connect() {
    await client.connect();
}
connect()

client.on('connect', () => console.log('::> Redis Client Connected'));
client.on('error', (err) => console.log('<:: Redis Client Error', err));
module.exports = client