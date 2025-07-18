const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

beforeEach(() => {
  // Clean up any existing changes files
  const changesFile = path.join(__dirname, '..', 'local_changes.json');
  const testChangesFile = path.join(__dirname, '..', 'test_local_changes.json');
  
  if (fs.existsSync(changesFile)) {
    fs.unlinkSync(changesFile);
  }
  if (fs.existsSync(testChangesFile)) {
    fs.unlinkSync(testChangesFile);
  }
  
  // Clear module cache to ensure fresh state
  delete require.cache[require.resolve('../index.js')];
});

afterEach(() => {
  // Clean up any existing changes files
  const changesFile = path.join(__dirname, '..', 'local_changes.json');
  const testChangesFile = path.join(__dirname, '..', 'test_local_changes.json');
  
  if (fs.existsSync(changesFile)) {
    fs.unlinkSync(changesFile);
  }
  if (fs.existsSync(testChangesFile)) {
    fs.unlinkSync(testChangesFile);
  }
});

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};