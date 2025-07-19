/**
 * Tests for tag update functionality
 * These tests verify that tag changes are properly sent to the API and tracked locally
 */

const request = require('supertest');
const nock = require('nock');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Tag Update Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should update note tags and track the change', async () => {
    const noteId = '123';
    const originalNote = { 
      id: noteId, 
      title: 'Test Note', 
      content: 'Test content',
      tags: ['old-tag', 'existing-tag']
    };
    const updatedTags = ['new-tag', 'existing-tag', 'another-tag'];
    const updateData = {
      tags: updatedTags,
      owner: null
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock updating the note
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(200, { data: { ...originalNote, tags: updatedTags } });

    // Send the update request
    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual(updatedTags);
  });

  it('should update note owner and tags together', async () => {
    const noteId = '124';
    const originalNote = { 
      id: noteId, 
      title: 'Test Note', 
      content: 'Test content',
      tags: ['tag1'],
      owner: null
    };
    const updateData = {
      tags: ['tag1', 'tag2'],
      owner: { id: 'user1' }
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock updating the note
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(200, { data: { ...originalNote, ...updateData } });

    // Send the update request
    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual(['tag1', 'tag2']);
    expect(response.body.data.owner).toEqual({ id: 'user1' });
  });

  it('should handle empty tags array', async () => {
    const noteId = '125';
    const originalNote = { 
      id: noteId, 
      title: 'Test Note', 
      content: 'Test content',
      tags: ['tag-to-remove']
    };
    const updateData = {
      tags: [], // Remove all tags
      owner: null
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock updating the note
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(200, { data: { ...originalNote, tags: [] } });

    // Send the update request
    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual([]);
  });

  it('should track local changes when updating tags', async () => {
    const noteId = '126';
    const originalNote = { 
      id: noteId, 
      title: 'Test Note', 
      content: 'Test content',
      tags: ['old-tag']
    };
    const updateData = {
      tags: ['new-tag'],
      owner: null
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock updating the note
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(200, { data: { ...originalNote, tags: ['new-tag'] } });

    // Send the update request
    await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    // Check that the change was tracked
    const changesResponse = await request(app).get('/api/changes');
    expect(changesResponse.status).toBe(200);
    
    const changes = changesResponse.body;
    const tagChange = changes.find(c => c.remoteId === noteId && c.type === 'update');
    
    expect(tagChange).toBeDefined();
    expect(tagChange.data.tags).toEqual(['new-tag']);
    expect(tagChange.originalData.tags).toEqual(['old-tag']);
  });

  it('should handle API errors gracefully', async () => {
    const noteId = '127';
    const updateData = {
      tags: ['new-tag'],
      owner: null
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: { id: noteId, title: 'Test', tags: [] } });

    // Mock API failure on update
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(500, { error: 'Internal server error' });

    // Send the update request
    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to update note');
  });
});