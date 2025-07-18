const request = require('supertest');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Final Comprehensive Test Suite', () => {
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

  describe('Application Functionality', () => {
    it('should serve the main HTML page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Productboard Notes Manager');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent');
      expect(response.status).toBe(404);
    });

    it('should fetch notes from API', async () => {
      const mockNotes = {
        data: [
          { id: '1', title: 'Note 1', content: 'Content 1' },
          { id: '2', title: 'Note 2', content: 'Content 2' }
        ]
      };

      nock('https://api.productboard.com')
        .get('/notes')
        .reply(200, mockNotes);

      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle API errors when fetching notes', async () => {
      nock('https://api.productboard.com')
        .get('/notes')
        .reply(500, { error: 'Server error' });

      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch notes from Productboard API');
    });

    it('should create a new note and track changes', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'Test content',
        user: { email: 'test@example.com' }
      };

      nock('https://api.productboard.com')
        .post('/notes')
        .reply(200, { data: { id: '123', ...noteData } });

      const response = await request(app)
        .post('/api/notes')
        .send(noteData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Test Note');

      // Check that change was tracked
      const changesResponse = await request(app).get('/api/changes');
      expect(changesResponse.status).toBe(200);
      expect(changesResponse.body.length).toBeGreaterThan(0);
      
      // Find our specific change
      const ourChange = changesResponse.body.find(c => c.data.title === 'Test Note');
      expect(ourChange).toBeDefined();
      expect(ourChange.type).toBe('create');
    });

    it('should handle creation errors', async () => {
      nock('https://api.productboard.com')
        .post('/notes')
        .reply(400, { error: 'Bad request' });

      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create note');
    });

    it('should update a note', async () => {
      const noteId = '124';
      const originalNote = { id: noteId, title: 'Original', content: 'Original content' };
      const updatedNote = { title: 'Updated', content: 'Updated content' };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .put(`/notes/${noteId}`)
        .reply(200, { data: { ...originalNote, ...updatedNote } });

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updatedNote);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated');
    });

    it('should handle update errors', async () => {
      nock('https://api.productboard.com')
        .get('/notes/999')
        .reply(404, { error: 'Not found' });

      const response = await request(app)
        .put('/api/notes/999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update note');
    });

    it('should delete a note', async () => {
      const noteId = '125';
      const originalNote = { id: noteId, title: 'To Delete', content: 'Content' };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}`)
        .reply(200, {});

      const response = await request(app)
        .delete(`/api/notes/${noteId}`);

      expect(response.status).toBe(200);
    });

    it('should handle deletion errors', async () => {
      nock('https://api.productboard.com')
        .get('/notes/999')
        .reply(404, { error: 'Not found' });

      const response = await request(app)
        .delete('/api/notes/999');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete note');
    });

    it('should return 404 for non-existent rollback change', async () => {
      const response = await request(app)
        .post('/api/rollback/non-existent-change-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Change not found');
    });

    it('should include proper authentication headers', async () => {
      const scope = nock('https://api.productboard.com')
        .get('/notes')
        .matchHeader('Authorization', 'Bearer test-token')
        .matchHeader('X-Version', '1')
        .reply(200, { data: [] });

      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      nock('https://api.productboard.com')
        .get('/notes')
        .replyWithError('Network timeout');

      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch notes from Productboard API');
    });

    it('should perform rollback operation', async () => {
      // First create a note to get a change to rollback
      const noteData = { title: 'Rollback Test', content: 'Content for rollback' };

      nock('https://api.productboard.com')
        .post('/notes')
        .reply(200, { data: { id: '456', ...noteData } });

      const createResponse = await request(app)
        .post('/api/notes')
        .send(noteData);

      expect(createResponse.status).toBe(200);

      // Get the changes to find our new change
      const changesResponse = await request(app).get('/api/changes');
      expect(changesResponse.status).toBe(200);
      
      // Find the change we just created
      const ourChange = changesResponse.body.find(c => c.data && c.data.title === 'Rollback Test');
      expect(ourChange).toBeDefined();

      // Now rollback this change
      nock('https://api.productboard.com')
        .delete('/notes/456')
        .reply(200, {});

      const rollbackResponse = await request(app)
        .post(`/api/rollback/${ourChange.id}`);

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.success).toBe(true);

      // Verify the change was removed
      const changesAfterRollback = await request(app).get('/api/changes');
      const rollbackedChange = changesAfterRollback.body.find(c => c.id === ourChange.id);
      expect(rollbackedChange).toBeUndefined();
    });

    it('should handle rollback errors', async () => {
      // Create a note first
      const noteData = { title: 'Rollback Error Test', content: 'Content' };

      nock('https://api.productboard.com')
        .post('/notes')
        .reply(200, { data: { id: '789', ...noteData } });

      const createResponse = await request(app)
        .post('/api/notes')
        .send(noteData);

      expect(createResponse.status).toBe(200);

      // Get the change
      const changesResponse = await request(app).get('/api/changes');
      const ourChange = changesResponse.body.find(c => c.data && c.data.title === 'Rollback Error Test');
      expect(ourChange).toBeDefined();

      // Mock a rollback error
      nock('https://api.productboard.com')
        .delete('/notes/789')
        .reply(500, { error: 'Server error' });

      const rollbackResponse = await request(app)
        .post(`/api/rollback/${ourChange.id}`);

      expect(rollbackResponse.status).toBe(500);
      expect(rollbackResponse.body.error).toBe('Failed to rollback change');
    });
  });
});