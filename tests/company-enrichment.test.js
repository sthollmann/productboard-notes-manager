const request = require('supertest');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Company Enrichment Tests', () => {
  beforeAll(() => {
    // Clean up changes file before all tests
    const changesFile = path.join(__dirname, '..', 'local_changes.json');
    try {
      if (fs.existsSync(changesFile)) {
        fs.unlinkSync(changesFile);
      }
    } catch (error) {
      // Ignore cleanup errors
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
    try {
      if (fs.existsSync(changesFile)) {
        fs.unlinkSync(changesFile);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Notes API with Company Enrichment', () => {
    it('should enrich notes with company names when companies have IDs', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Test Note 1',
            content: 'Test content 1',
            company: { id: 'company-1' },
            user: { email: 'user1@test.com' },
            tags: ['test1']
          },
          {
            id: '2',
            title: 'Test Note 2',
            content: 'Test content 2',
            company: { id: 'company-2' },
            user: { email: 'user2@test.com' },
            tags: ['test2']
          }
        ],
        pageCursor: null,
        totalResults: 2
      };

      const mockCompany1 = {
        data: {
          id: 'company-1',
          name: 'Acme Corporation',
          domain: 'acme.com',
          description: 'Leading technology company'
        }
      };

      const mockCompany2 = {
        data: {
          id: 'company-2',
          name: 'Tech Solutions Inc',
          domain: 'techsolutions.com',
          description: 'Software development company'
        }
      };

      // Mock the notes API call
      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      // Mock the company details API calls
      nock('https://api.productboard.com')
        .get('/companies/company-1')
        .reply(200, mockCompany1);

      nock('https://api.productboard.com')
        .get('/companies/company-2')
        .reply(200, mockCompany2);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      
      // Check that company names are enriched
      expect(response.body.data[0].company.name).toBe('Acme Corporation');
      expect(response.body.data[1].company.name).toBe('Tech Solutions Inc');
      
      // Check that original company IDs are preserved
      expect(response.body.data[0].company.id).toBe('company-1');
      expect(response.body.data[1].company.id).toBe('company-2');
    });

    it('should handle notes without company information', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Test Note 1',
            content: 'Test content 1',
            user: { email: 'user1@test.com' },
            tags: ['test1']
          },
          {
            id: '2',
            title: 'Test Note 2',
            content: 'Test content 2',
            company: null,
            user: { email: 'user2@test.com' },
            tags: ['test2']
          }
        ],
        pageCursor: null,
        totalResults: 2
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      
      // Check that notes without company data are handled properly
      expect(response.body.data[0].company).toBeUndefined();
      expect(response.body.data[1].company).toBeNull();
    });

    it('should handle company API failures gracefully', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Test Note 1',
            content: 'Test content 1',
            company: { id: 'company-1' },
            user: { email: 'user1@test.com' },
            tags: ['test1']
          }
        ],
        pageCursor: null,
        totalResults: 1
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      // Mock company API to return 404 (company not found)
      nock('https://api.productboard.com')
        .get('/companies/company-1')
        .reply(404, { error: 'Company not found' });

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      
      // Check that the original company object is preserved when enrichment fails
      expect(response.body.data[0].company.id).toBe('company-1');
      expect(response.body.data[0].company.name).toBeUndefined();
    });

    it('should handle mixed company data (some with IDs, some without)', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Note with company ID',
            content: 'Test content 1',
            company: { id: 'company-1' },
            user: { email: 'user1@test.com' }
          },
          {
            id: '2',
            title: 'Note without company',
            content: 'Test content 2',
            user: { email: 'user2@test.com' }
          },
          {
            id: '3',
            title: 'Note with null company',
            content: 'Test content 3',
            company: null,
            user: { email: 'user3@test.com' }
          }
        ],
        pageCursor: null,
        totalResults: 3
      };

      const mockCompany1 = {
        data: {
          id: 'company-1',
          name: 'Test Company',
          domain: 'test.com'
        }
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      nock('https://api.productboard.com')
        .get('/companies/company-1')
        .reply(200, mockCompany1);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      
      // Check that company with ID is enriched
      expect(response.body.data[0].company.name).toBe('Test Company');
      
      // Check that notes without company data are unchanged
      expect(response.body.data[1].company).toBeUndefined();
      expect(response.body.data[2].company).toBeNull();
    });

    it('should handle duplicate company IDs efficiently', async () => {
      const mockNotesResponse = {
        data: [
          {
            id: '1',
            title: 'Note 1',
            content: 'Test content 1',
            company: { id: 'company-1' },
            user: { email: 'user1@test.com' }
          },
          {
            id: '2',
            title: 'Note 2',
            content: 'Test content 2',
            company: { id: 'company-1' },
            user: { email: 'user2@test.com' }
          },
          {
            id: '3',
            title: 'Note 3',
            content: 'Test content 3',
            company: { id: 'company-1' },
            user: { email: 'user3@test.com' }
          }
        ],
        pageCursor: null,
        totalResults: 3
      };

      const mockCompany1 = {
        data: {
          id: 'company-1',
          name: 'Duplicate Company',
          domain: 'duplicate.com'
        }
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotesResponse);

      // Should only make one API call for the same company ID
      nock('https://api.productboard.com')
        .get('/companies/company-1')
        .reply(200, mockCompany1);

      const response = await request(app).get('/api/notes');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      
      // All notes should have the same company name
      expect(response.body.data[0].company.name).toBe('Duplicate Company');
      expect(response.body.data[1].company.name).toBe('Duplicate Company');
      expect(response.body.data[2].company.name).toBe('Duplicate Company');
    });
  });
});