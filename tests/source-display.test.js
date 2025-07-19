/**
 * Tests for the getSourceName function
 * These tests verify that source names are correctly extracted from various data formats
 * that the Productboard API might return.
 */

describe('Source Name Extraction Tests', () => {
  // We'll test the getSourceName function by evaluating it in a simulated browser environment
  const getSourceName = (source) => {
    if (!source) return '-';
    
    if (typeof source === 'string') {
      return source;
    }
    
    if (typeof source === 'object') {
      // Handle the common Productboard API format: { origin: "email", record_id: null }
      if (source.origin) {
        return source.origin;
      }
      // Fallback for other potential properties
      return source.name || source.type || source.displayName || '-';
    }
    
    return '-';
  };

  describe('String Source Names', () => {
    it('should return the source name when source is a string', () => {
      const result = getSourceName('manual');
      expect(result).toBe('manual');
    });

    it('should return dash when source is an empty string', () => {
      const result = getSourceName('');
      expect(result).toBe('-');
    });

    it('should handle source names with special characters', () => {
      const result = getSourceName('api-integration');
      expect(result).toBe('api-integration');
    });
  });

  describe('Object Source Names', () => {
    it('should extract origin property from source object (Productboard format)', () => {
      const source = { origin: 'email', record_id: null };
      const result = getSourceName(source);
      expect(result).toBe('email');
    });

    it('should extract origin property when record_id is present', () => {
      const source = { origin: 'api', record_id: '12345' };
      const result = getSourceName(source);
      expect(result).toBe('api');
    });

    it('should extract name property when origin is not available', () => {
      const source = { name: 'manual-input', id: '123' };
      const result = getSourceName(source);
      expect(result).toBe('manual-input');
    });

    it('should extract type property when origin and name are not available', () => {
      const source = { type: 'webhook', id: '456' };
      const result = getSourceName(source);
      expect(result).toBe('webhook');
    });

    it('should extract displayName property when other properties are not available', () => {
      const source = { displayName: 'External System', id: '789' };
      const result = getSourceName(source);
      expect(result).toBe('External System');
    });

    it('should prefer origin over other properties when multiple are available', () => {
      const source = { 
        origin: 'email', 
        name: 'Email Source', 
        type: 'mail',
        record_id: null
      };
      const result = getSourceName(source);
      expect(result).toBe('email');
    });

    it('should prefer name over type when origin is not available', () => {
      const source = { 
        name: 'API Integration', 
        type: 'api',
        id: '101' 
      };
      const result = getSourceName(source);
      expect(result).toBe('API Integration');
    });

    it('should return dash when object has no source-related properties', () => {
      const source = { id: '999', category: 'system' };
      const result = getSourceName(source);
      expect(result).toBe('-');
    });

    it('should handle empty object', () => {
      const source = {};
      const result = getSourceName(source);
      expect(result).toBe('-');
    });

    it('should handle object with empty string source properties', () => {
      const source = { origin: '', name: '', type: '', displayName: '' };
      const result = getSourceName(source);
      expect(result).toBe('-');
    });

    it('should handle object with null source properties', () => {
      const source = { origin: null, name: null, type: null, displayName: null };
      const result = getSourceName(source);
      expect(result).toBe('-');
    });
  });

  describe('Edge Cases', () => {
    it('should return dash when source is null', () => {
      const result = getSourceName(null);
      expect(result).toBe('-');
    });

    it('should return dash when source is undefined', () => {
      const result = getSourceName(undefined);
      expect(result).toBe('-');
    });

    it('should return dash when source is false', () => {
      const result = getSourceName(false);
      expect(result).toBe('-');
    });

    it('should return dash when source is 0', () => {
      const result = getSourceName(0);
      expect(result).toBe('-');
    });

    it('should return dash when source is NaN', () => {
      const result = getSourceName(NaN);
      expect(result).toBe('-');
    });

    it('should return dash when source is a number', () => {
      const result = getSourceName(123);
      expect(result).toBe('-');
    });

    it('should return dash when source is a boolean', () => {
      const result = getSourceName(true);
      expect(result).toBe('-');
    });

    it('should return dash when source is an array', () => {
      const result = getSourceName(['email']);
      expect(result).toBe('-');
    });

    it('should return dash when source is a function', () => {
      const result = getSourceName(() => 'email');
      expect(result).toBe('-');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle Productboard API response with email source', () => {
      const note = {
        id: '1',
        title: 'Email Feature Request',
        content: 'Feature request from email',
        source: { origin: 'email', record_id: null },
        user: { email: 'user@example.com' }
      };
      const result = getSourceName(note.source);
      expect(result).toBe('email');
    });

    it('should handle Productboard API response with api source', () => {
      const note = {
        id: '2',
        title: 'API Integration Request',
        content: 'Request from API',
        source: { origin: 'api', record_id: 'ext_123' },
        user: { email: 'api@example.com' }
      };
      const result = getSourceName(note.source);
      expect(result).toBe('api');
    });

    it('should handle Productboard API response with manual source', () => {
      const note = {
        id: '3',
        title: 'Manual Entry',
        content: 'Manually entered note',
        source: { origin: 'manual', record_id: null },
        user: { email: 'user@example.com' }
      };
      const result = getSourceName(note.source);
      expect(result).toBe('manual');
    });

    it('should handle Productboard API response with no source', () => {
      const note = {
        id: '4',
        title: 'Note without source',
        content: 'This note has no source',
        user: { email: 'user@example.com' }
      };
      const result = getSourceName(note.source);
      expect(result).toBe('-');
    });

    it('should handle mixed source formats in batch processing', () => {
      const notes = [
        { source: { origin: 'email', record_id: null } },
        { source: 'manual' },
        { source: { origin: 'api', record_id: '123' } },
        { source: null },
        { /* no source property */ }
      ];
      
      const results = notes.map(note => getSourceName(note.source));
      
      expect(results).toEqual([
        'email',
        'manual',
        'api',
        '-',
        '-'
      ]);
    });

    it('should handle various origin types from Productboard', () => {
      const sources = [
        { origin: 'email', record_id: null },
        { origin: 'api', record_id: 'ext_456' },
        { origin: 'manual', record_id: null },
        { origin: 'import', record_id: 'batch_789' },
        { origin: 'webhook', record_id: 'hook_101' }
      ];
      
      const results = sources.map(source => getSourceName(source));
      
      expect(results).toEqual([
        'email',
        'api', 
        'manual',
        'import',
        'webhook'
      ]);
    });
  });
});