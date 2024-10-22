const redis = require('../../config/redisClient');
const { logTaskAction } = require('../util.service');

// Function to push task to Redis queue with timestamp
async function addToQueue(taskData) {
    // Add timestamp to task data
    const taskWithTimestamp = { ...taskData, timestamp: Date.now() };
    await redis.RPUSH(`taskQueue:${taskData.user_id}`, JSON.stringify(taskWithTimestamp));
    await logTaskAction('Task added to queue', taskData.user_id, taskWithTimestamp); // Log task addition
}

// Function to get the length of the task queue for a user
async function getQueueLength(user_id) {
    return await redis.LLEN(`taskQueue:${user_id}`);
}

// Function to process task queue for each user
async function processQueue() {
    // Get all unique users with tasks in their queue
    const userIds = await redis.KEYS('taskQueue:*');

    try {
        for (const key of userIds) {
            const user_id = key.split(':')[1];
            let queueLength = await getQueueLength(user_id);
    
            // Check if the user has queued tasks
            if (queueLength > 0) {
                let processedCount = 0; // Count processed tasks
    
                // Loop through tasks while the count is less than 20 and the queue is not empty
                while (processedCount < 20 && queueLength > 0) {
                    const taskData = await redis.LPOP(`taskQueue:${user_id}`);
                    
                    if (taskData) {
                        const parsedTask = JSON.parse(taskData);
    
                        // Check if the task is older than 1 minute (60000 ms)
                        const currentTime = Date.now();
                        const taskAge = currentTime - parsedTask.timestamp;
    
                        // Process the task if it is older than 1 minute
                        if (taskAge > 60 * 1000) {
                            await logTaskAction('Task processed and removed from que', parsedTask.user_id, parsedTask); // Log task processing
                            console.log('Task processed and removed from que', parsedTask.user_id, parsedTask);
                            
                            processedCount++;
                        } else {
                            // If the task is too young, put it back in the queue
                            await redis.RPUSH(`taskQueue:${user_id}`, taskData);
                            break; // Stop processing more tasks for this user
                        }
                    }
                    queueLength = await getQueueLength(user_id); // Update queue length
                }
            }
        }
    } catch (error) {
        console.log(error);
        
    }
}


module.exports = {
    addToQueue,
    processQueue,
    getQueueLength,
    // cleanUpOldTasks
};
