const request = require('supertest');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Company Display Tests', () => {
  beforeAll(() => {
    // Clean up changes file before all tests
    const changesFile = path.join(__dirname, '..', 'local_changes.json');
    if (fs.existsSync(changesFile)) {
      fs.unlinkSync(changesFile);
    }
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    // Clean up after all tests
    const changesFile = path.join(__dirname, '..', 'local_changes.json');
    if (fs.existsSync(changesFile)) {
      fs.unlinkSync(changesFile);
    }
  });

  describe('Company Data Structure Handling', () => {
    it('should handle notes with company as string', async () => {
      const mockNotes = {
        data: [
          {
            id: '1',
            title: 'Test Note 1',
            content: 'Test content',
            company: 'Acme Corp',
            user: { email: 'test@acme.com' },
            tags: ['test']
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].company).toBe('Acme Corp');
    });

    it('should handle notes with company as object with name property', async () => {
      const mockNotes = {
        data: [
          {
            id: '2',
            title: 'Test Note 2',
            content: 'Test content',
            company: { name: 'Tech Solutions Inc', id: '123' },
            user: { email: 'test@techsolutions.com' },
            tags: ['enterprise']
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].company).toEqual({ name: 'Tech Solutions Inc', id: '123' });
    });

    it('should handle notes with company as object with displayName property', async () => {
      const mockNotes = {
        data: [
          {
            id: '3',
            title: 'Test Note 3',
            content: 'Test content',
            company: { displayName: 'Global Enterprises', id: '456' },
            user: { email: 'test@global.com' },
            tags: ['global']
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].company).toEqual({ displayName: 'Global Enterprises', id: '456' });
    });

    it('should handle notes with no company data', async () => {
      const mockNotes = {
        data: [
          {
            id: '4',
            title: 'Test Note 4',
            content: 'Test content',
            user: { email: 'test@example.com' },
            tags: ['no-company']
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].company).toBeUndefined();
    });

    it('should handle notes with null company data', async () => {
      const mockNotes = {
        data: [
          {
            id: '5',
            title: 'Test Note 5',
            content: 'Test content',
            company: null,
            user: { email: 'test@example.com' },
            tags: ['null-company']
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].company).toBeNull();
    });
  });

  describe('HTML Interface Tests', () => {
    it('should serve HTML page with company display logic', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Productboard Notes Manager');
      expect(response.text).toContain('Company'); // Table header
    });

    it('should contain getCompanyName function for proper company display', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('getCompanyName'); // Function should exist
    });
  });

  describe('Mixed Company Data Types', () => {
    it('should handle mixed company data types in the same response', async () => {
      const mockNotes = {
        data: [
          {
            id: '1',
            title: 'String Company',
            content: 'Test content',
            company: 'String Corp',
            user: { email: 'test1@example.com' }
          },
          {
            id: '2',
            title: 'Object Company with name',
            content: 'Test content',
            company: { name: 'Object Corp', id: '123' },
            user: { email: 'test2@example.com' }
          },
          {
            id: '3',
            title: 'Object Company with displayName',
            content: 'Test content',
            company: { displayName: 'Display Corp', id: '456' },
            user: { email: 'test3@example.com' }
          },
          {
            id: '4',
            title: 'No Company',
            content: 'Test content',
            user: { email: 'test4@example.com' }
          }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(4);
      
      // Verify different company formats are preserved
      expect(response.body.data[0].company).toBe('String Corp');
      expect(response.body.data[1].company).toEqual({ name: 'Object Corp', id: '123' });
      expect(response.body.data[2].company).toEqual({ displayName: 'Display Corp', id: '456' });
      expect(response.body.data[3].company).toBeUndefined();
    });
  });
});