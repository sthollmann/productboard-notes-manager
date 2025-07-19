const request = require('supertest');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Source Display Integration Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Source Data Structure Handling', () => {
    it('should handle notes with source as object with origin property', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Email Note',
            content: 'From email',
            source: { origin: 'email', record_id: null },
            user: { email: 'user@test.com' },
            tags: []
          }
        ],
        pageCursor: null,
        totalResults: 1
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toEqual({ origin: 'email', record_id: null });
    });

    it('should handle notes with source as string', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Manual Note',
            content: 'Manually entered',
            source: 'manual',
            user: { email: 'user@test.com' },
            tags: []
          }
        ],
        pageCursor: null,
        totalResults: 1
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toBe('manual');
    });

    it('should handle notes with no source data', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Note without source',
            content: 'No source info',
            user: { email: 'user@test.com' },
            tags: []
          }
        ],
        pageCursor: null,
        totalResults: 1
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toBeUndefined();
    });

    it('should handle notes with null source data', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Note with null source',
            content: 'Null source info',
            source: null,
            user: { email: 'user@test.com' },
            tags: []
          }
        ],
        pageCursor: null,
        totalResults: 1
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toBeNull();
    });
  });

  describe('HTML Interface Tests', () => {
    it('should serve HTML page with source display logic', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('getSourceName');
      expect(response.text).toContain('function getSourceName(source)');
      expect(response.text).toContain('getSourceIcon');
      expect(response.text).toContain('function getSourceIcon(source)');
    });

    it('should contain getSourceIcon function for proper source icon display', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      // Check that the function handles icon generation
      expect(response.text).toContain('source-icon');
      expect(response.text).toContain('📧'); // email icon
      expect(response.text).toContain('company-logo'); // company logo class
      expect(response.text).toContain('slack-new-logo.svg'); // Slack logo URL
      expect(response.text).toContain('zendesk-1.svg'); // Zendesk logo URL
      expect(response.text).toContain('productboard.svg'); // Productboard logo URL
      // Check that it's used in the table rendering
      expect(response.text).toContain('getSourceIcon(note.source)');
    });

    it('should contain getSourceName function for proper source display', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      // Check that the function handles object sources
      expect(response.text).toContain('source.origin');
      // The table should now use getSourceIcon instead of getSourceName
      expect(response.text).not.toContain('getSourceName(note.source)');
    });
  });

  describe('Mixed Source Data Types', () => {
    it('should handle mixed source data types in the same response', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Email Note',
            content: 'From email',
            source: { origin: 'email', record_id: null },
            user: { email: 'user1@test.com' },
            tags: []
          },
          {
            id: '2',
            title: 'Manual Note',
            content: 'Manual entry',
            source: 'manual',
            user: { email: 'user2@test.com' },
            tags: []
          },
          {
            id: '3',
            title: 'API Note',
            content: 'From API',
            source: { origin: 'api', record_id: 'ext_123' },
            user: { email: 'user3@test.com' },
            tags: []
          },
          {
            id: '4',
            title: 'No Source Note',
            content: 'No source',
            user: { email: 'user4@test.com' },
            tags: []
          }
        ],
        pageCursor: null,
        totalResults: 4
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(4);
      
      // Verify different source formats are preserved
      expect(response.body.data[0].source).toEqual({ origin: 'email', record_id: null });
      expect(response.body.data[1].source).toBe('manual');
      expect(response.body.data[2].source).toEqual({ origin: 'api', record_id: 'ext_123' });
      expect(response.body.data[3].source).toBeUndefined();
    });
  });

  describe('Real Productboard Source Formats', () => {
    it('should handle various origin types from Productboard API', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Email Note',
            source: { origin: 'email', record_id: null },
            user: { email: 'user@test.com' }
          },
          {
            id: '2',
            title: 'API Note',
            source: { origin: 'api', record_id: 'external_456' },
            user: { email: 'api@test.com' }
          },
          {
            id: '3',
            title: 'Manual Note',
            source: { origin: 'manual', record_id: null },
            user: { email: 'admin@test.com' }
          },
          {
            id: '4',
            title: 'Import Note',
            source: { origin: 'import', record_id: 'batch_789' },
            user: { email: 'import@test.com' }
          },
          {
            id: '5',
            title: 'Webhook Note',
            source: { origin: 'webhook', record_id: 'hook_101' },
            user: { email: 'webhook@test.com' }
          }
        ],
        pageCursor: null,
        totalResults: 5
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      
      // Verify all source types are preserved correctly
      expect(response.body.data[0].source.origin).toBe('email');
      expect(response.body.data[1].source.origin).toBe('api');
      expect(response.body.data[2].source.origin).toBe('manual');
      expect(response.body.data[3].source.origin).toBe('import');
      expect(response.body.data[4].source.origin).toBe('webhook');
    });
  });
});