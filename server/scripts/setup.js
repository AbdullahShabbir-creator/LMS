const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');

// Path definitions
const envPath = path.join(__dirname, '../.env');
const createEnvPath = path.join(__dirname, './create-env.js');

// Create .env file if it doesn't exist
function ensureEnvFile() {
  console.log("Checking for .env file...");
  
  if (fs.existsSync(envPath)) {
    console.log(".env file already exists.");
    return true;
  }
  
  // If create-env.js exists, run it to create the .env file
  if (fs.existsSync(createEnvPath)) {
    console.log("Using create-env.js to generate .env file...");
    try {
      require('./create-env.js');
      console.log(".env file created successfully using create-env.js");
      return true;
    } catch (error) {
      console.error("Failed to create .env file using create-env.js:", error.message);
    }
  } else {
    console.log("create-env.js not found. Creating default .env file...");
    // Create a basic .env file with default settings matching the user's format
    const defaultEnvContent = `PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lms
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
JWT_SECRET=supersecretkey
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@lms.com
ADMIN_NAME=Admin
CLOUDINARY_CLOUD_NAME=default_cloud_name
CLOUDINARY_API_KEY=default_api_key
CLOUDINARY_API_SECRET=default_api_secret
OPENAI_API_KEY=`;

    try {
      fs.writeFileSync(envPath, defaultEnvContent, 'utf8');
      console.log("Default .env file created successfully");
      return true;
    } catch (error) {
      console.error("Failed to create default .env file:", error.message);
      return false;
    }
  }
}

// Load environment variables
function loadEnvFile() {
  try {
    require('dotenv').config({ path: envPath });
    console.log("Environment variables loaded from .env file");
    return true;
  } catch (error) {
    console.error("Failed to load environment variables:", error.message);
    return false;
  }
}

// Check MongoDB connection
async function checkMongoDBConnection() {
  try {
    console.log("Testing MongoDB connection...");
    
    // Get MongoDB URI from environment variables
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms';
    // Mask the username and password in logs for security
    const maskedUri = mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://[username]:[password]@');
    console.log(`Attempting to connect to MongoDB at: ${maskedUri}`);
    
    // Try to connect to MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log("MongoDB connection successful!");
    return true;
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    return false;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

// Check if required environment variables are set
function checkRequiredEnvVars() {
  const requiredVars = [
    'PORT', 
    'MONGO_URI', 
    'JWT_SECRET', 
    'SMTP_USER', 
    'SMTP_PASS',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('Please update your .env file with the missing values');
    return false;
  }
  
  console.log("All required environment variables are set");
  return true;
}

// Main setup function
async function setup() {
  console.log("=== LMS System Setup ===");
  
  // Ensure .env file exists
  const envCreated = ensureEnvFile();
  if (!envCreated) {
    console.log("Warning: Failed to create or verify .env file. Setup may not work correctly.");
  }
  
  // Load environment variables
  loadEnvFile();
  
  // Check required environment variables
  checkRequiredEnvVars();
  
  // Check MongoDB connection
  const isMongoConnected = await checkMongoDBConnection();
  
  if (!isMongoConnected) {
    console.log("\n⚠️ MongoDB connection failed. Please check your MongoDB connection string in the .env file.");
    console.log("If you're using MongoDB Atlas, make sure your IP address is whitelisted.");
    console.log("Your current connection string might have invalid credentials or network restrictions.");
    console.log("If you're using a local MongoDB instance, make sure it's installed and running:");
    console.log("- Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/");
    console.log("- Mac: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-macos/");
    console.log("- Linux: https://www.mongodb.com/docs/manual/administration/install-on-linux/\n");
  }
  
  console.log("\n=== Setup Complete ===");
  console.log("To start the backend server: npm run dev");
  console.log("To start the frontend: cd ../frontend && npm start");
  console.log("To start both together: cd .. && npm run dev");
}

// Run the setup
setup().catch(console.error); 