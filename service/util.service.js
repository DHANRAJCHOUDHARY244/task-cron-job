// Error Web Response
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { successCode } = require('../config/constant');

const logFile = path.join(__dirname, '../logs/task_log.txt');
// Promisify fs.appendFile for logging
const logTask = promisify(fs.appendFile);

module.exports.ensureLogFileExists = function () {
  const filePath = logFile;
    // Check if the log directory exists
    const logDir = path.dirname(filePath);
    if (!fs.existsSync(logDir)) {
      // Create the logs directory if it does not exist
      fs.mkdirSync(logDir, { recursive: true });
    }
  
    // Check if the log file exists
    if (!fs.existsSync(filePath)) {
      // Create the log file if it does not exist
      fs.writeFileSync(filePath, '', { flag: 'wx' }); // Create an empty file
      console.log(`Log file created at: ${filePath}`);
    }
  };
  


module.exports.ReE = function (res, code, message) { 
    let err_obj = {
        "status": code, "message": message
    }
    return res.status(code).json(err_obj);
};
// Success Web Response
module.exports.ReS = function (res, status, message, data) { 
    let res_obj = {
        "status": status,
        "message": message,
        "data": data
    }
        return res.status(successCode).json(res_obj);
};

// Function to log task actions
module.exports.logTaskAction= async function(action, user_id, taskDetails) {
  const logMessage = `${new Date().toISOString()} - ${action} for user ${user_id}: ${JSON.stringify(taskDetails)}\n`;
  await logTask(logFile, logMessage);
}
