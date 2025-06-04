/**
 * LMS System Runner Script
 * 
 * This script:
 * 1. Sets up the environment (.env file) for the server
 * 2. Checks MongoDB connection
 * 3. Starts both frontend and backend servers
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');
       
// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define paths
const serverDir = path.join(__dirname, 'server');
const frontendDir = path.join(__dirname, 'frontend');
const envPath = path.join(serverDir, '.env');

// Create .env file if it doesn't exist
function createEnvFile() {
  console.log('Checking for .env file...');
  
  if (fs.existsSync(envPath)) {
    console.log('.env file already exists.');
    return;
  }
  
  console.log('Creating .env file...');
  
  const envContent = `# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/lms

# Server Configuration
PORT=3001
NODE_ENV=development
SKIP_AUTH=true

# JWT Configuration
JWT_SECRET=supersecretkey

# SMTP Configuration for Email
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=default_cloud_name
CLOUDINARY_API_KEY=default_api_key
CLOUDINARY_API_SECRET=default_api_secret

# OpenAI Configuration (Optional)
OPENAI_API_KEY=

# Development mode settings
DEBUG=true`;
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('.env file created successfully.');
}

// Check MongoDB connection
function checkMongoDB() {
  return new Promise((resolve) => {
    console.log('Checking MongoDB connection...');
    
    // Use mongosh or mongo to check connection
    const mongoCheckProcess = spawn('mongosh', ['--eval', 'db.serverStatus()'], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    
    mongoCheckProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mongoCheckProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    mongoCheckProcess.on('close', (code) => {
      if (code === 0 && output.includes('ok')) {
        console.log('MongoDB is running and accessible.');
        resolve(true);
      } else {
        console.log('MongoDB is not accessible. The system will use fallback authentication.');
        console.log('To install MongoDB:');
        console.log('- Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/');
        console.log('- Mac: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-macos/');
        console.log('- Linux: https://www.mongodb.com/docs/manual/administration/install-on-linux/\n');
        resolve(false);
      }
    });
  });
}

// Install dependencies if needed
function installDependencies() {
  return new Promise((resolve) => {
    console.log('Checking and installing dependencies...');
    
    // Check and install server dependencies
    console.log('Installing server dependencies...');
    exec('cd server && npm install', (error, stdout, stderr) => {
      if (error) {
        console.error('Error installing server dependencies:', error);
      } else {
        console.log('Server dependencies installed.');
      }
      
      // Install frontend dependencies
      console.log('Installing frontend dependencies...');
      exec('cd frontend && npm install', (error, stdout, stderr) => {
        if (error) {
          console.error('Error installing frontend dependencies:', error);
        } else {
          console.log('Frontend dependencies installed.');
        }
        
        resolve();
      });
    });
  });
}

// Start backend server
function startBackend() {
  console.log('Starting backend server...');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('error', (error) => {
    console.error('Failed to start backend server:', error);
  });
  
  return serverProcess;
}

// Start frontend server
function startFrontend() {
  console.log('Starting frontend server...');
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });
  
  frontendProcess.on('error', (error) => {
    console.error('Failed to start frontend server:', error);
  });
  
  return frontendProcess;
}

// Main function
async function main() {
  console.log('===== LMS System Startup =====');
  
  // Create .env file if it doesn't exist
  createEnvFile();
  
  // Check MongoDB connection
  await checkMongoDB();
  
  // Ask to install dependencies or start servers
  rl.question('Do you want to install dependencies before starting? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await installDependencies();
    }
    
    // Start servers
    rl.question('Start the servers now? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('Starting servers...');
        
        // Start backend first, then frontend
        const backendProcess = startBackend();
        
        // Wait a bit for the backend to start
        setTimeout(() => {
          const frontendProcess = startFrontend();
          
          // Handle graceful shutdown
          const cleanup = () => {
            console.log('Shutting down servers...');
            backendProcess.kill();
            frontendProcess.kill();
            rl.close();
            process.exit(0);
          };
          
          // Listen for termination signals
          process.on('SIGINT', cleanup);
          process.on('SIGTERM', cleanup);
        }, 3000);
      } else {
        console.log('Server startup canceled.');
        rl.close();
      }
    });
  });
}

// Run the main function
main().catch(console.error); 