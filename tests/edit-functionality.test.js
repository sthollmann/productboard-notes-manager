/**
 * Tests for the new edit-only functionality
 * These tests verify that the interface only supports editing tags and owner, not creating notes
 */

const request = require('supertest');
const app = require('../index.js');

describe('Edit Functionality Tests', () => {
  describe('HTML Interface', () => {
    it('should not contain create note tab', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).not.toContain('Create Note');
      expect(response.text).not.toContain('create-tab');
      expect(response.text).not.toContain('create-note-form');
    });

    it('should contain edit modal for note editing', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('edit-modal');
      expect(response.text).toContain('Edit Note');
      expect(response.text).toContain('edit-note-form');
    });

    it('should contain edit functionality for tags', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('edit-note-tags');
      expect(response.text).toContain('edit-tags-display');
      expect(response.text).toContain('tags-display');
      expect(response.text).toContain('Enter tags separated by commas');
    });

    it('should contain edit functionality for owner', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('edit-note-owner');
      expect(response.text).toContain('Owner');
      expect(response.text).toContain('No owner assigned');
    });

    it('should contain modal close functionality', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('closeEditModal');
      expect(response.text).toContain('&times;');
    });

    it('should contain edit form submission handler', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('edit-note-form');
      expect(response.text).toContain('addEventListener');
      expect(response.text).toContain('PUT');
    });

    it('should contain owner selection functionality', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('loadOwnerOptions');
      expect(response.text).toContain('Product Manager');
      expect(response.text).toContain('Customer Success');
      expect(response.text).toContain('Engineering Lead');
    });

    it('should have readonly title field in edit form', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('edit-note-title');
      expect(response.text).toContain('readonly');
    });

    it('should only have Notes and Local Changes tabs', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      
      // Should have these tabs
      expect(response.text).toContain('Notes');
      expect(response.text).toContain('Local Changes');
      
      // Should not have create tab
      expect(response.text).not.toContain('onclick="showTab(\'create\')"');
    });

    it('should contain edit button in table actions', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('editNote');
      expect(response.text).toContain('Edit</button>');
    });
  });

  describe('Modal Functionality', () => {
    it('should include CSS styles for modal', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('.modal {');
      expect(response.text).toContain('.modal-content {');
      expect(response.text).toContain('.modal-header {');
      expect(response.text).toContain('position: fixed');
      expect(response.text).toContain('z-index: 1000');
    });

    it('should include form action styles', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('.form-actions {');
      expect(response.text).toContain('.btn-secondary {');
      expect(response.text).toContain('justify-content: flex-end');
    });

    it('should include readonly input styles', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('input[readonly] {');
      expect(response.text).toContain('background-color: #f8f9fa');
      expect(response.text).toContain('cursor: not-allowed');
    });
  });

  describe('JavaScript Functionality', () => {
    it('should contain editNote function with modal logic', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('function editNote(noteId)');
      expect(response.text).toContain('edit-note-id');
      expect(response.text).toContain('edit-modal');
      expect(response.text).toContain('style.display = \'block\'');
    });

    it('should contain closeEditModal function', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('function closeEditModal()');
      expect(response.text).toContain('style.display = \'none\'');
    });

    it('should contain loadOwnerOptions function', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('function loadOwnerOptions');
      expect(response.text).toContain('edit-note-owner');
      expect(response.text).toContain('createElement(\'option\')');
    });

    it('should handle form submission with PUT request', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('method: \'PUT\'');
      expect(response.text).toContain('/api/notes/${noteId}');
      expect(response.text).toContain('updateData');
    });

    it('should handle modal outside click to close', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('window.onclick');
      expect(response.text).toContain('event.target === modal');
      expect(response.text).toContain('closeEditModal');
    });

    it('should contain tag management functions', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('currentEditTags');
      expect(response.text).toContain('updateTagsDisplay');
      expect(response.text).toContain('removeTag');
      expect(response.text).toContain('addTagFromInput');
    });

    it('should handle tag input events', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('addEventListener(\'keydown\'');
      expect(response.text).toContain('addEventListener(\'blur\'');
      expect(response.text).toContain('e.key === \'Enter\'');
      expect(response.text).toContain('e.key === \'Tab\'');
    });

    it('should include visual tag styles', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('.tags-display {');
      expect(response.text).toContain('.tags-display .tag {');
      expect(response.text).toContain('padding-right: 20px');
      expect(response.text).toContain('content: "×"');
    });
  });
});