import { createClient } from 'redis';

const REDIS_URI = process.env.REDIS_URI;
if (!REDIS_URI) {
  throw new Error(
    'Please define the REDIS_URI environment variable inside .env.local'
  );
}

const redisConnect = () => {
  const redis = createClient({
    url: REDIS_URI,
    pingInterval: 5000,
    socket: {
      reconnectStrategy: retries => Math.min(retries * 50, 1000)
    },    
  });
  redis.on('end', (err) => {
    console.error('redis connection ended:', err);
  });
  redis.on('ready', () => {
    console.log('redis is ready');
  })
  redis.on("reconnecting", function () {
    console.log("redis reconnecting");
  });
  redis.on("connect", function () {
    console.log('redis is connected');
  });
  return redis;
};
// const redis = connect();

export default redisConnect;
