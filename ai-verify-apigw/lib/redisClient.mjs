import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const REDIS_URI = "redis://"+redisHost+":"+redisPort;

if (!REDIS_URI) {
  throw new Error(
    'Please define the REDIS_URI environment variable inside .env.local'
  )
}

const redisConnect = () => {
  const redis = createClient({
    url: REDIS_URI,
    // retry_strategy: retries => Math.min(retries * 50, 1000),
    socket_keepalive: 'true',
    socket_initial_delay: 10000,
  
    socket: {
      reconnectStrategy: retries => Math.min(retries * 50, 1000)
      // Abort connecting to redis after 3 retries.
      // PY: remove below and use default reconnect strategy
      // reconnectStrategy: (retries) => {
      //   if (retries > 2) {
      //     console.error("Too many connect retries on redis.");
      //     return new Error("Too many connect retries on redis.");
      //   }
      //   else {
      //     return retries;
        // }
      // },
    },
  });
  redis.on('error', (err) => {
    console.error('redis connection error:', err);
    // redis.disconnect();
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

  redis.connect();
  
  return redis; 
}
// const redis = connect();

export default redisConnect