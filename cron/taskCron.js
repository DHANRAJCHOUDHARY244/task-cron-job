const cron = require('node-cron');
const { processQueue} = require('../service/redis/query.service');

// Schedule cron job to run every second
cron.schedule('* * * * * *', async () => {
    // Process up to 20 tasks from each user's queue
    await processQueue();

});
