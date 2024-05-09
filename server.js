const express = require('express');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;  

// Connect to MongoDB using the URI from environment variable
mongoose.connect(process.env.MONGODB_URI,);
const db = mongoose.connection;

// Define application schema
const applicationSchema = new mongoose.Schema({
  name: String,
  path: String,
  icon: String,
  parameters: [String]
});

// Create Application model
const Application = mongoose.model('Application', applicationSchema);

app.use(express.json());
app.use(cors());

// Retrieve all applications
app.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find({});
    res.json(applications);
  } catch (err) {
    console.error('Error retrieving applications:', err);
    res.status(500).send('Error retrieving applications');
  }
});

// Launch an application
app.get('/launch/:appName', async (req, res) => {
  const appName = req.params.appName;
  try {
    const appToLaunch = await Application.findOne({ name: appName });
    if (!appToLaunch) {
      return res.status(404).send('Application not found');
    }

    const appProcess = spawn(appToLaunch.path);

    appProcess.on('error', (err) => {
      console.error('Failed to start application:', err);
      res.status(500).send('Failed to start application');
    });

    appProcess.on('close', (code) => {
      console.log(`Application closed with code ${code}`);
      res.send(`Application closed with code ${code}`);
    });
  } catch (err) {
    console.error('Error finding or launching application:', err);
    res.status(500).send('Error finding or launching application');
  }
});

// Add a new application
app.post('/applications', async (req, res) => {
  const { name, path, icon, parameters } = req.body;

  try {
    const newApp = new Application({
      name,
      path,
      icon,
      parameters
    });
  
    const savedApp = await newApp.save();
    res.json(savedApp);
  } catch (err) {
    console.error('Error saving application:', err);
    res.status(500).send('Error saving application');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
