#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Logging utilities
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Check if directory has node_modules
function hasNodeModules(dir) {
  return fs.existsSync(path.join(dir, 'node_modules'));
}

// Check if port is available
function isPortAvailable(port) {
  try {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    execSync(command, { stdio: 'ignore' });
    return false;
  } catch {
    return true;
  }
}

// Get Node.js version
function getNodeVersion() {
  const version = process.version.replace('v', '');
  return parseInt(version.split('.')[0]);
}

// Main function
async function main() {
  log.info('Sky Light - Starting development servers...\n');

  // Check Node.js version
  const nodeVersion = getNodeVersion();
  if (nodeVersion < 18) {
    log.error(`Node.js version 18 or higher is required. Current version: ${process.version}`);
    process.exit(1);
  }
  log.success(`Node.js ${process.version} detected`);

  // Check npm
  if (!commandExists('npm')) {
    log.error('npm is not installed. Please install npm.');
    process.exit(1);
  }
  log.success('npm detected');

  // Check for Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log('');
    log.warning('Supabase credentials not detected');
    log.info('The backend will use mock in-memory data');
    log.info('To use real database, set environment variables:');
    console.log('  export SUPABASE_URL="https://your-project.supabase.co"');
    console.log('  export SUPABASE_KEY="your-anon-key"');
    console.log('');
    log.info('Or create a .env file in apps/backend/ with:');
    console.log('  SUPABASE_URL=https://your-project.supabase.co');
    console.log('  SUPABASE_KEY=your-anon-key');
    console.log('');
  } else {
    log.success('Supabase credentials detected');
    log.info(`Backend will connect to: ${process.env.SUPABASE_URL}`);
  }

  // Check dependencies
  let needsInstall = false;
  const checkPaths = [
    '.',
    'packages/shared-types',
    'apps/backend',
    'apps/frontend',
  ];

  for (const checkPath of checkPaths) {
    if (!hasNodeModules(checkPath)) {
      log.warning(`Dependencies not found in ${checkPath}`);
      needsInstall = true;
    }
  }

  // Install dependencies if needed
  if (needsInstall) {
    log.info('Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      log.success('Dependencies installed successfully');
    } catch (error) {
      log.error('Failed to install dependencies');
      process.exit(1);
    }
  } else {
    log.success('All dependencies are installed');
  }

  // Check ports
  if (!isPortAvailable(3000)) {
    log.error('Port 3000 is already in use. Please free it before starting the backend.');
    process.exit(1);
  }

  if (!isPortAvailable(5173)) {
    log.error('Port 5173 is already in use. Please free it before starting the frontend.');
    process.exit(1);
  }

  log.success('Ports 3000 and 5173 are available\n');

  // Start servers
  log.info('Starting backend and frontend servers...');
  log.info('Backend: http://localhost:3000');
  log.info('Frontend: http://localhost:5173\n');
  log.warning('Press Ctrl+C to stop all servers\n');

  // Spawn npm run dev
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  // Handle cleanup
  const cleanup = () => {
    log.info('\nShutting down servers...');
    devProcess.kill();
    log.success('Servers stopped');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  devProcess.on('error', (error) => {
    log.error(`Failed to start servers: ${error.message}`);
    process.exit(1);
  });

  devProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log.error(`Servers exited with code ${code}`);
      process.exit(code);
    }
  });
}

// Run main function
main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

