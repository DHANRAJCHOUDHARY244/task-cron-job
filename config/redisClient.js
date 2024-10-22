const redis = require("redis");

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_USERNAME = process.env.REDIS_USERNAME;

const url = (REDIS_HOST === 'localhost'|| '127.0.0.1'?`redis://${REDIS_HOST}:${REDIS_PORT}`:`redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}` )

// Create a Redis client with detailed connection options
const redisClient = redis.createClient({
  url:url,
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Error connecting to Redis:", error);
  }
})();

redisClient.on("ready", () => {
  console.log("✅️ Redis Connected Successfully Hurry 🥳🎉!");
});

redisClient.on("error", (err) => {
  console.error("❌ Error in the Connection 🥺", err);
});

// Event listener for connection lost
redisClient.on("end", () => {
  console.log("❌ Connection to Redis has ended.");
});

// Gracefully close the connection on process exit
process.on("SIGINT", async () => {
  console.log("🔌 Closing Redis connection...");
  await redisClient.quit();
  process.exit(0);
});

module.exports = redisClient;
