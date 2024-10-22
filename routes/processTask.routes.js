const express = require('express');
const { processTask } = require('../controller/task.controller');
const { addToQueue } = require('../service/redis/query.service');
const { rateLimitExceededCode } = require('../config/constant');
const { ReE } = require('../service/util.service');
const redis = require('../config/redisClient');
const router = express.Router();

// Redis-based rate limiter using key-value store (string)
const rateLimiter = async (req, res, next) => {
    const user_id = req.body.user_id;

    if (!user_id) {
        return ReE(res, 400, 'User ID is required.');
    }

    const currentTime = Date.now();
    const userKey = `rateLimiter:${user_id}`;
    const requestLimit = 20; // Max 20 requests per minute
    const timeWindow = 60 * 1000; // 1 minute window
    const requestGap = 1000; // Minimum gap of 1 second between requests

    try {
        // Fetch user request details from Redis
        let userData = await redis.get(userKey);

        // Initialize requestCount and lastRequestTime if no data is found
        let requestCount = 0;
        let lastRequestTime = 0;

        if (userData) {
            const parsedData = JSON.parse(userData);
            requestCount = parsedData.requestCount || 0;
            lastRequestTime = parsedData.lastRequestTime || 0;
        }

        // If no data or more than timeWindow has passed, reset the count
        if (!userData || currentTime - lastRequestTime > timeWindow) {
            requestCount = 1;
            lastRequestTime = currentTime;
            await redis.set(userKey, JSON.stringify({ requestCount, lastRequestTime }), 'EX', 60); // Set TTL of 1 minute
        } else {
            // Check if the user has exceeded the rate limit
            if (requestCount >= requestLimit && currentTime - lastRequestTime < timeWindow) {
                await addToQueue({ user_id });
                return ReE(res, rateLimitExceededCode, `Rate limit exceeded for user: ${user_id}. Task has been queued.`);
            }

            // Check if the user is making requests too fast (minimum 1-second gap)
            if (currentTime - lastRequestTime < requestGap) {
                return ReE(res, rateLimitExceededCode, 'Please wait a second before making another request.');
            }

            // Increment the request count and update lastRequestTime
            requestCount += 1;
            lastRequestTime = currentTime;

            // Save the updated request count and last request time to Redis
            await redis.set(userKey, JSON.stringify({ requestCount, lastRequestTime }), 'EX', 60); // Reset TTL to 1 minute
        }

        next(); // Proceed to task processing
    } catch (err) {
        console.error('Rate Limiter Error:', err);
        return ReE(res, 500, 'Internal server error.');
    }
};

// Apply Redis-based rate limiter to the POST route
router.post('/process-task', rateLimiter, processTask);

module.exports = router;
