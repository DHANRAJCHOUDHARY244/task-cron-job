const { addToQueue, getQueueLength } = require('../service/redis/query.service');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { ReS, ReE, logTaskAction } = require('../service/util.service');
const {  successCode, serverErrorCode } = require('../config/constant');


// Controller to handle task requests
async function processTask(req, res) {
   try {
    const { user_id } = req.body;
    // Process the task immediately
    await logTaskAction("Task done successfully",user_id,{user_id,timeStamp:Date.now()});
    console.log("Task done successfully",user_id,{user_id,timeStamp:Date.now()});
    
    return ReS(res, successCode, "Task done successfully", `Task executed for user: ${user_id}`);
   } catch (error) {
    ReE(res,serverErrorCode,`"Oops! Something went wrong!" ${error.message}`);
   }
}

module.exports = {
    processTask
};
