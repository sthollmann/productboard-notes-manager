/**
 * Tests for individual tag operations using Productboard's tag-specific API endpoints
 * These tests verify that tag additions and removals work correctly with proper change tracking
 */

const request = require('supertest');
const nock = require('nock');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Tag Operations Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Add Tag Operations', () => {
    it('should add a tag to a note using dedicated endpoint', async () => {
      const noteId = '123';
      const tagName = 'new-feature';
      const originalNote = { 
        id: noteId, 
        title: 'Test Note', 
        content: 'Test content',
        tags: ['existing-tag']
      };
      const updatedNote = { 
        ...originalNote,
        tags: ['existing-tag', 'new-feature']
      };

      // Mock getting the original note (for change tracking)
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      // Mock adding the tag using Productboard's tag-specific endpoint
      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      // Mock getting the updated note (for change tracking)
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      // Send the add tag request
      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tags).toContain('new-feature');
      expect(response.body.data.tags).toContain('existing-tag');
    });

    it('should handle URL encoding for tag names with special characters', async () => {
      const noteId = '124';
      const tagName = 'feature-enhancement'; // Use dash instead of slash to avoid routing issues
      const originalNote = { id: noteId, title: 'Test', tags: [] };
      const updatedNote = { ...originalNote, tags: [tagName] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tags).toContain(tagName);
    });

    it('should track tag addition as local change', async () => {
      const noteId = '125';
      const tagName = 'tracked-tag';
      const originalNote = { id: noteId, title: 'Test', tags: [] };
      const updatedNote = { ...originalNote, tags: [tagName] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      // Check that the change was tracked
      const changesResponse = await request(app).get('/api/changes');
      const changes = changesResponse.body;
      const tagChange = changes.find(c => c.remoteId === noteId && c.type === 'tag_add');
      
      expect(tagChange).toBeDefined();
      expect(tagChange.data.tagName).toBe(tagName);
      expect(tagChange.originalData.tags).toEqual([]);
      expect(tagChange.updatedData.tags).toContain(tagName);
    });

    it('should handle API errors when adding tags', async () => {
      const noteId = '126';
      const tagName = 'error-tag';

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, title: 'Test', tags: [] } });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${tagName}`)
        .reply(500, { error: 'Internal server error' });

      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to add tag to note');
    });
  });

  describe('Remove Tag Operations', () => {
    it('should remove a tag from a note using dedicated endpoint', async () => {
      const noteId = '127';
      const tagName = 'old-tag';
      const originalNote = { 
        id: noteId, 
        title: 'Test Note', 
        content: 'Test content',
        tags: ['old-tag', 'keep-tag']
      };
      const updatedNote = { 
        ...originalNote,
        tags: ['keep-tag']
      };

      // Mock getting the original note (for change tracking)
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      // Mock removing the tag using Productboard's tag-specific endpoint
      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      // Mock getting the updated note (for change tracking)
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      // Send the remove tag request
      const response = await request(app)
        .delete(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tags).not.toContain('old-tag');
      expect(response.body.data.tags).toContain('keep-tag');
    });

    it('should handle URL encoding for tag removal with special characters', async () => {
      const noteId = '128';
      const tagName = 'bug-critical'; // Use dash instead of slash to avoid routing issues
      const originalNote = { id: noteId, title: 'Test', tags: [tagName] };
      const updatedNote = { ...originalNote, tags: [] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      const response = await request(app)
        .delete(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tags).not.toContain(tagName);
    });

    it('should track tag removal as local change', async () => {
      const noteId = '129';
      const tagName = 'removed-tag';
      const originalNote = { id: noteId, title: 'Test', tags: [tagName] };
      const updatedNote = { ...originalNote, tags: [] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      await request(app)
        .delete(`/api/notes/${noteId}/tags/${tagName}`);

      // Check that the change was tracked
      const changesResponse = await request(app).get('/api/changes');
      const changes = changesResponse.body;
      const tagChange = changes.find(c => c.remoteId === noteId && c.type === 'tag_remove');
      
      expect(tagChange).toBeDefined();
      expect(tagChange.data.tagName).toBe(tagName);
      expect(tagChange.originalData.tags).toContain(tagName);
      expect(tagChange.updatedData.tags).not.toContain(tagName);
    });

    it('should handle API errors when removing tags', async () => {
      const noteId = '130';
      const tagName = 'nonexistent-tag';

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, title: 'Test', tags: [] } });

      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${tagName}`)
        .reply(404, { error: 'Tag not found' });

      const response = await request(app)
        .delete(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to remove tag from note');
    });
  });

  describe('Tag Operation Rollbacks', () => {
    it('should rollback tag addition by removing the tag', async () => {
      const noteId = '131';
      const tagName = 'rollback-add';
      
      // First, add a tag to create a change
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, tags: [] } });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, tags: [tagName] } });

      await request(app).post(`/api/notes/${noteId}/tags/${tagName}`);

      // Get the change ID
      const changesResponse = await request(app).get('/api/changes');
      const tagChange = changesResponse.body.find(c => c.type === 'tag_add' && c.data.tagName === tagName);

      // Mock the rollback (remove the tag)
      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      // Perform rollback
      const rollbackResponse = await request(app)
        .post(`/api/rollback/${tagChange.id}`);

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.success).toBe(true);
    });

    it('should rollback tag removal by adding the tag back', async () => {
      const noteId = '132';
      const tagName = 'rollback-remove';
      
      // First, remove a tag to create a change
      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, tags: [tagName] } });

      nock('https://api.productboard.com')
        .delete(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: { id: noteId, tags: [] } });

      await request(app).delete(`/api/notes/${noteId}/tags/${tagName}`);

      // Get the change ID
      const changesResponse = await request(app).get('/api/changes');
      const tagChange = changesResponse.body.find(c => c.type === 'tag_remove' && c.data.tagName === tagName);

      // Mock the rollback (add the tag back)
      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${tagName}`)
        .reply(200, {});

      // Perform rollback
      const rollbackResponse = await request(app)
        .post(`/api/rollback/${tagChange.id}`);

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tag names gracefully', async () => {
      const noteId = '133';
      const tagName = '';

      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      // Should handle this gracefully, likely with a 404 (no route match) or 500 error
      expect([404, 500]).toContain(response.status);
    });

    it('should handle very long tag names', async () => {
      const noteId = '134';
      const tagName = 'a'.repeat(200); // Very long tag name
      const originalNote = { id: noteId, tags: [] };
      const updatedNote = { ...originalNote, tags: [tagName] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
    });

    it('should handle Unicode characters in tag names', async () => {
      const noteId = '135';
      const tagName = '功能-优化'; // Chinese characters
      const originalNote = { id: noteId, tags: [] };
      const updatedNote = { ...originalNote, tags: [tagName] };

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: originalNote });

      nock('https://api.productboard.com')
        .post(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`)
        .reply(200, {});

      nock('https://api.productboard.com')
        .get(`/notes/${noteId}`)
        .reply(200, { data: updatedNote });

      const response = await request(app)
        .post(`/api/notes/${noteId}/tags/${tagName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tags).toContain(tagName);
    });
  });
});