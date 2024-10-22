require('dotenv').config();
const express = require('express');
const taskRoutes = require('./routes/processTask.routes');
const { ensureLogFileExists } = require('./service/util.service');
require('./cron/taskCron');  // Import cron job to process tasks

// Initialize express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task routes
app.use('/api', taskRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)});
    console.log(`
                             ░▒█░░▒█░▒█░░░░▒█▀▀▄░░░▀▀█▀▀░█▀▀▄░▒█▀▀▀█░▒█░▄▀░░░▒█▀▀▄░▒█▀▀▄░▒█▀▀▀█░▒█▄░▒█
                             ░▒█▒█▒█░▒█░░░░▒█░░░░░░░▒█░░▒█▄▄█░░▀▀▀▄▄░▒█▀▄░░░░▒█░░░░▒█▄▄▀░▒█░░▒█░▒█▒█▒█
                             ░▒▀▄▀▄▀░▒█▄▄█░▒█▄▄▀░░░░▒█░░▒█░▒█░▒█▄▄▄█░▒█░▒█░░░▒█▄▄▀░▒█░▒█░▒█▄▄▄█░▒█░░▀█
                `);

ensureLogFileExists()
