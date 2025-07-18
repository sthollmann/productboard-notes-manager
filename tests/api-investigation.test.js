const request = require('supertest');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('API Investigation Tests', () => {
  beforeAll(() => {
    // Clean up changes file before all tests
    const changesFile = path.join(__dirname, '..', 'local_changes.json');
    if (fs.existsSync(changesFile)) {
      fs.unlinkSync(changesFile);
    }
  });

  afterAll(() => {
    // Clean up after all tests
    const changesFile = path.join(__dirname, '..', 'local_changes.json');
    if (fs.existsSync(changesFile)) {
      fs.unlinkSync(changesFile);
    }
  });

  describe('Real API Response Investigation', () => {
    it('should make actual API call to investigate response structure', async () => {
      // Skip this test if we don't have a real API token
      if (!process.env.PRODUCTBOARD_API_TOKEN || process.env.PRODUCTBOARD_API_TOKEN === 'test-token') {
        console.log('Skipping real API test - no valid token provided');
        return;
      }

      const response = await request(app).get('/api/notes');
      
      console.log('=== API RESPONSE INVESTIGATION ===');
      console.log('Status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      
      if (response.body.data && response.body.data.length > 0) {
        console.log('=== FIRST NOTE STRUCTURE ===');
        console.log(JSON.stringify(response.body.data[0], null, 2));
        
        console.log('=== COMPANY FIELD ANALYSIS ===');
        const firstNote = response.body.data[0];
        console.log('Company field exists:', 'company' in firstNote);
        console.log('Company value:', firstNote.company);
        console.log('Company type:', typeof firstNote.company);
        
        if (firstNote.company && typeof firstNote.company === 'object') {
          console.log('Company object keys:', Object.keys(firstNote.company));
          console.log('Company object values:', Object.values(firstNote.company));
        }
      }
      
      // The test will pass regardless - we just want to see the output
      expect(response.status).toBeDefined();
    });
  });
});