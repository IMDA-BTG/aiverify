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

    socket: {
      reconnectStrategy: retries => Math.min(retries * 50, 1000)
    },    
  });
  redis.on('error', (err) => {
    console.error('Portal Redis connection error:', err);
  });
  redis.on('end', (err) => {
    console.error('Portal Redis connection ended:', err);
  });
  redis.on('ready', () => {
    console.info('Portal Message queue is ready')
  });
  redis.on("reconnecting", function () {
    console.log("Portal Redis reconnecting");
  });
  redis.on("connect", function () {
    console.log('Portal Redis is connected');
  });  
  // if (NODE_ENV !== 'test')
  redis.connect();
  return redis;
};
// const redis = connect();

export default redisConnect;
