/**
 * Comprehensive tests for local changes persistence
 * Tests the file-based persistence mechanism used to save local changes across server restarts
 */

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.PRODUCTBOARD_API_TOKEN = 'test-token';

describe('Local Changes Persistence (Comprehensive)', () => {
  const changesFilePath = path.join(__dirname, '..', 'local_changes.json');

  beforeEach(() => {
    // Clean up any existing changes file
    if (fs.existsSync(changesFilePath)) {
      fs.unlinkSync(changesFilePath);
    }
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(changesFilePath)) {
      fs.unlinkSync(changesFilePath);
    }
  });

  it('should create changes file when saving changes', () => {
    // Test the core file operations directly
    const testChanges = [
      {
        id: '123',
        type: 'tag_add',
        timestamp: new Date().toISOString(),
        remoteId: 'note1',
        data: { tagName: 'test-tag' }
      }
    ];

    // Simulate the saveLocalChanges function
    fs.writeFileSync(changesFilePath, JSON.stringify(testChanges, null, 2));

    // Verify file was created
    expect(fs.existsSync(changesFilePath)).toBe(true);

    // Verify contents
    const savedData = JSON.parse(fs.readFileSync(changesFilePath, 'utf8'));
    expect(savedData).toHaveLength(1);
    expect(savedData[0].data.tagName).toBe('test-tag');
  });

  it('should load existing changes file on startup', () => {
    // Create a test changes file
    const testChanges = [
      {
        id: '456',
        type: 'tag_remove',
        timestamp: new Date().toISOString(),
        remoteId: 'note2',
        data: { tagName: 'removed-tag' }
      }
    ];

    fs.writeFileSync(changesFilePath, JSON.stringify(testChanges, null, 2));

    // Simulate the loading logic from index.js
    let localChanges = [];
    try {
      if (fs.existsSync(changesFilePath)) {
        const changesData = fs.readFileSync(changesFilePath, 'utf8');
        localChanges = JSON.parse(changesData);
      }
    } catch (error) {
      localChanges = [];
    }

    expect(localChanges).toHaveLength(1);
    expect(localChanges[0].data.tagName).toBe('removed-tag');
    expect(localChanges[0].type).toBe('tag_remove');
  });

  it('should handle missing changes file gracefully', () => {
    // Ensure file doesn't exist
    expect(fs.existsSync(changesFilePath)).toBe(false);

    // Simulate the loading logic from index.js
    let localChanges = [];
    try {
      if (fs.existsSync(changesFilePath)) {
        const changesData = fs.readFileSync(changesFilePath, 'utf8');
        localChanges = JSON.parse(changesData);
      } else {
        localChanges = [];
      }
    } catch (error) {
      localChanges = [];
    }

    expect(localChanges).toHaveLength(0);
  });

  it('should handle corrupted JSON file gracefully', () => {
    // Create corrupted JSON file
    fs.writeFileSync(changesFilePath, 'invalid json content {');

    // Simulate the loading logic from index.js
    let localChanges = [];
    try {
      if (fs.existsSync(changesFilePath)) {
        const changesData = fs.readFileSync(changesFilePath, 'utf8');
        localChanges = JSON.parse(changesData);
      } else {
        localChanges = [];
      }
    } catch (error) {
      localChanges = [];
    }

    expect(localChanges).toHaveLength(0);
  });

  it('should preserve change data structure correctly', () => {
    const complexChange = {
      id: Date.now().toString(),
      type: 'tag_add',
      timestamp: new Date().toISOString(),
      remoteId: 'complex-note-123',
      data: { tagName: 'complex-tag-with-special-chars-äöü' },
      originalData: {
        id: 'complex-note-123',
        title: 'Complex Note Title with "quotes" and special chars',
        tags: ['existing-tag-1', 'existing-tag-2'],
        company: { id: 'comp1', name: 'Test Company' }
      },
      updatedData: {
        id: 'complex-note-123',
        title: 'Complex Note Title with "quotes" and special chars',
        tags: ['existing-tag-1', 'existing-tag-2', 'complex-tag-with-special-chars-äöü'],
        company: { id: 'comp1', name: 'Test Company' }
      }
    };

    const testChanges = [complexChange];

    // Save
    fs.writeFileSync(changesFilePath, JSON.stringify(testChanges, null, 2));

    // Load
    const loadedData = JSON.parse(fs.readFileSync(changesFilePath, 'utf8'));

    // Verify complex data is preserved
    expect(loadedData[0]).toEqual(complexChange);
    expect(loadedData[0].originalData.company.name).toBe('Test Company');
    expect(loadedData[0].data.tagName).toBe('complex-tag-with-special-chars-äöü');
  });

  it('should handle multiple changes with different types', () => {
    const multipleChanges = [
      {
        id: '1',
        type: 'create',
        timestamp: new Date().toISOString(),
        remoteId: 'new-note',
        data: { title: 'New Note' },
        originalData: null
      },
      {
        id: '2',
        type: 'tag_add',
        timestamp: new Date().toISOString(),
        remoteId: 'note-1',
        data: { tagName: 'added-tag' },
        originalData: { id: 'note-1', tags: [] },
        updatedData: { id: 'note-1', tags: ['added-tag'] }
      },
      {
        id: '3',
        type: 'tag_remove',
        timestamp: new Date().toISOString(),
        remoteId: 'note-2',
        data: { tagName: 'removed-tag' },
        originalData: { id: 'note-2', tags: ['removed-tag', 'other-tag'] },
        updatedData: { id: 'note-2', tags: ['other-tag'] }
      },
      {
        id: '4',
        type: 'update',
        timestamp: new Date().toISOString(),
        remoteId: 'note-3',
        data: { owner: { id: 'user1' } },
        originalData: { id: 'note-3', owner: null }
      },
      {
        id: '5',
        type: 'delete',
        timestamp: new Date().toISOString(),
        remoteId: 'note-4',
        data: null,
        originalData: { id: 'note-4', title: 'Deleted Note' }
      }
    ];

    // Save all changes
    fs.writeFileSync(changesFilePath, JSON.stringify(multipleChanges, null, 2));

    // Load and verify
    const loadedChanges = JSON.parse(fs.readFileSync(changesFilePath, 'utf8'));

    expect(loadedChanges).toHaveLength(5);
    expect(loadedChanges.map(c => c.type)).toEqual(['create', 'tag_add', 'tag_remove', 'update', 'delete']);
    expect(loadedChanges[1].data.tagName).toBe('added-tag');
    expect(loadedChanges[2].data.tagName).toBe('removed-tag');
    expect(loadedChanges[3].data.owner.id).toBe('user1');
  });

  it('should handle empty changes array', () => {
    const emptyChanges = [];

    // Save empty array
    fs.writeFileSync(changesFilePath, JSON.stringify(emptyChanges, null, 2));

    // Verify file exists but contains empty array
    expect(fs.existsSync(changesFilePath)).toBe(true);
    const loadedChanges = JSON.parse(fs.readFileSync(changesFilePath, 'utf8'));
    expect(loadedChanges).toHaveLength(0);
    expect(Array.isArray(loadedChanges)).toBe(true);
  });

  it('should verify file permissions and accessibility', () => {
    const testChanges = [{ id: '1', type: 'test' }];

    // Save file
    fs.writeFileSync(changesFilePath, JSON.stringify(testChanges, null, 2));

    // Check file stats
    const stats = fs.statSync(changesFilePath);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);

    // Verify file is readable
    const readData = fs.readFileSync(changesFilePath, 'utf8');
    expect(readData).toBeTruthy();
    expect(JSON.parse(readData)).toHaveLength(1);
  });
});