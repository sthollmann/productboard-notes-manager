/**
 * Tests for enhanced change descriptions in the local changes display
 * These tests verify that change descriptions are descriptive and user-friendly
 */

const request = require('supertest');
const nock = require('nock');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

const app = require('../index.js');

describe('Change Description Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should serve HTML with enhanced change description functionality', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('getChangeDescription');
    expect(response.text).toContain('change-description');
    expect(response.text).toContain('change-timestamp');
    expect(response.text).toContain('note-id');
  });

  it('should include CSS styles for new change types', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('.change-type.tag_add');
    expect(response.text).toContain('.change-type.tag_remove');
    expect(response.text).toContain('.change-description');
    expect(response.text).toContain('.change-timestamp');
    expect(response.text).toContain('.note-id');
  });

  it('should track tag addition with descriptive information', async () => {
    const noteId = '123';
    const tagName = 'feature-request';
    const noteTitle = 'User Feedback Note';
    const originalNote = { 
      id: noteId, 
      title: noteTitle,
      content: 'Test content',
      tags: []
    };
    const updatedNote = { 
      ...originalNote,
      tags: [tagName]
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock adding the tag
    nock('https://api.productboard.com')
      .post(`/notes/${noteId}/tags/${tagName}`)
      .reply(200, {});

    // Mock getting the updated note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: updatedNote });

    // Add the tag
    await request(app).post(`/api/notes/${noteId}/tags/${tagName}`);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const tagChange = changes.find(c => c.type === 'tag_add' && c.data.tagName === tagName);
    
    expect(tagChange).toBeDefined();
    expect(tagChange.type).toBe('tag_add');
    expect(tagChange.data.tagName).toBe(tagName);
    expect(tagChange.originalData.title).toBe(noteTitle);
    expect(tagChange.originalData.tags).toEqual([]);
    expect(tagChange.updatedData.tags).toContain(tagName);
  });

  it('should track tag removal with descriptive information', async () => {
    const noteId = '124';
    const tagName = 'old-feature';
    const noteTitle = 'Legacy Feature Note';
    const originalNote = { 
      id: noteId, 
      title: noteTitle,
      content: 'Test content',
      tags: [tagName, 'keep-tag']
    };
    const updatedNote = { 
      ...originalNote,
      tags: ['keep-tag']
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock removing the tag
    nock('https://api.productboard.com')
      .delete(`/notes/${noteId}/tags/${tagName}`)
      .reply(200, {});

    // Mock getting the updated note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: updatedNote });

    // Remove the tag
    await request(app).delete(`/api/notes/${noteId}/tags/${tagName}`);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const tagChange = changes.find(c => c.type === 'tag_remove' && c.data.tagName === tagName);
    
    expect(tagChange).toBeDefined();
    expect(tagChange.type).toBe('tag_remove');
    expect(tagChange.data.tagName).toBe(tagName);
    expect(tagChange.originalData.title).toBe(noteTitle);
    expect(tagChange.originalData.tags).toContain(tagName);
    expect(tagChange.updatedData.tags).not.toContain(tagName);
  });

  it('should track owner updates with descriptive information', async () => {
    const noteId = '125';
    const noteTitle = 'Ownership Change Note';
    const originalNote = { 
      id: noteId, 
      title: noteTitle,
      content: 'Test content',
      owner: null,
      tags: []
    };
    const newOwner = { id: 'user1', name: 'Product Manager', email: 'pm@company.com' };
    const updateData = { owner: newOwner };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock updating the note
    nock('https://api.productboard.com')
      .put(`/notes/${noteId}`)
      .reply(200, { data: { ...originalNote, owner: newOwner } });

    // Update the owner
    await request(app)
      .put(`/api/notes/${noteId}`)
      .send(updateData);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const ownerChange = changes.find(c => c.type === 'update' && c.remoteId === noteId);
    
    expect(ownerChange).toBeDefined();
    expect(ownerChange.type).toBe('update');
    expect(ownerChange.originalData.title).toBe(noteTitle);
    expect(ownerChange.originalData.owner).toBeNull();
    expect(ownerChange.data.owner).toEqual(newOwner);
  });

  it('should track note creation with descriptive information', async () => {
    const noteTitle = 'New Feature Request';
    const noteData = {
      title: noteTitle,
      content: 'This is a new feature request',
      user: { email: 'user@example.com' },
      tags: ['new-feature']
    };
    const createdNote = { id: '126', ...noteData };

    // Mock creating the note
    nock('https://api.productboard.com')
      .post('/notes')
      .reply(201, { data: createdNote });

    // Create the note
    await request(app)
      .post('/api/notes')
      .send(noteData);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const createChange = changes.find(c => c.type === 'create' && c.data.title === noteTitle);
    
    expect(createChange).toBeDefined();
    expect(createChange.type).toBe('create');
    expect(createChange.data.title).toBe(noteTitle);
    expect(createChange.remoteId).toBe('126');
  });

  it('should track note deletion with descriptive information', async () => {
    const noteId = '127';
    const noteTitle = 'Note to Delete';
    const noteToDelete = { 
      id: noteId, 
      title: noteTitle,
      content: 'This note will be deleted',
      tags: ['to-delete']
    };

    // Mock getting the note before deletion
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: noteToDelete });

    // Mock deleting the note
    nock('https://api.productboard.com')
      .delete(`/notes/${noteId}`)
      .reply(200, {});

    // Delete the note
    await request(app).delete(`/api/notes/${noteId}`);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const deleteChange = changes.find(c => c.type === 'delete' && c.remoteId === noteId);
    
    expect(deleteChange).toBeDefined();
    expect(deleteChange.type).toBe('delete');
    expect(deleteChange.originalData.title).toBe(noteTitle);
    expect(deleteChange.remoteId).toBe(noteId);
  });

  it('should handle notes with missing titles gracefully', async () => {
    const noteId = '128';
    const tagName = 'test-tag';
    const originalNote = { 
      id: noteId, 
      // No title field
      content: 'Note without title',
      tags: []
    };
    const updatedNote = { 
      ...originalNote,
      tags: [tagName]
    };

    // Mock getting the original note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: originalNote });

    // Mock adding the tag
    nock('https://api.productboard.com')
      .post(`/notes/${noteId}/tags/${tagName}`)
      .reply(200, {});

    // Mock getting the updated note
    nock('https://api.productboard.com')
      .get(`/notes/${noteId}`)
      .reply(200, { data: updatedNote });

    // Add the tag
    await request(app).post(`/api/notes/${noteId}/tags/${tagName}`);

    // Check the changes
    const changesResponse = await request(app).get('/api/changes');
    const changes = changesResponse.body;
    const tagChange = changes.find(c => c.type === 'tag_add' && c.data.tagName === tagName);
    
    expect(tagChange).toBeDefined();
    expect(tagChange.type).toBe('tag_add');
    expect(tagChange.data.tagName).toBe(tagName);
    // Should handle missing title gracefully
    expect(tagChange.originalData.title).toBeUndefined();
  });
});