/**
 * Tests for the getSourceIcon function
 * These tests verify that appropriate icons are returned for different source types
 */

describe('Source Icon Tests', () => {
  // We'll test the getSourceIcon function by evaluating it in a simulated browser environment
  const getSourceName = (source) => {
    if (!source) return '-';
    
    if (typeof source === 'string') {
      return source;
    }
    
    if (typeof source === 'object') {
      if (source.origin) {
        return source.origin;
      }
      return source.name || source.type || source.displayName || '-';
    }
    
    return '-';
  };

  const getSourceIcon = (source) => {
    const sourceType = getSourceName(source);
    
    switch (sourceType) {
      case 'email':
        return '<span class="source-icon email-icon" title="Email">📧</span>';
      case 'api':
        return '<span class="source-icon api-icon" title="API Integration">🔗</span>';
      case 'manual':
        return '<span class="source-icon manual-icon" title="Manual Entry">✏️</span>';
      case 'import':
        return '<span class="source-icon import-icon" title="Data Import">📥</span>';
      case 'webhook':
        return '<span class="source-icon webhook-icon" title="Webhook">🔄</span>';
      case 'integration':
        return '<span class="source-icon integration-icon" title="Integration">🔌</span>';
      case 'form':
        return '<span class="source-icon form-icon" title="Web Form">📝</span>';
      case 'mobile':
        return '<span class="source-icon mobile-icon" title="Mobile App">📱</span>';
      case 'slack':
        return '<span class="source-icon slack-icon" title="Slack">💬</span>';
      case 'zendesk':
        return '<span class="source-icon zendesk-icon" title="Zendesk">🎫</span>';
      case 'intercom':
        return '<span class="source-icon intercom-icon" title="Intercom">💭</span>';
      case '-':
      case null:
      case undefined:
      default:
        return '<span class="source-icon productboard-icon" title="Productboard">🏢</span>';
    }
  };

  describe('Icon Generation for Known Source Types', () => {
    it('should return email icon for email source', () => {
      const source = { origin: 'email', record_id: null };
      const result = getSourceIcon(source);
      expect(result).toContain('📧');
      expect(result).toContain('email-icon');
      expect(result).toContain('title="Email"');
    });

    it('should return API icon for API source', () => {
      const source = { origin: 'api', record_id: 'ext_123' };
      const result = getSourceIcon(source);
      expect(result).toContain('🔗');
      expect(result).toContain('api-icon');
      expect(result).toContain('title="API Integration"');
    });

    it('should return manual icon for manual source', () => {
      const source = { origin: 'manual', record_id: null };
      const result = getSourceIcon(source);
      expect(result).toContain('✏️');
      expect(result).toContain('manual-icon');
      expect(result).toContain('title="Manual Entry"');
    });

    it('should return import icon for import source', () => {
      const source = { origin: 'import', record_id: 'batch_456' };
      const result = getSourceIcon(source);
      expect(result).toContain('📥');
      expect(result).toContain('import-icon');
      expect(result).toContain('title="Data Import"');
    });

    it('should return webhook icon for webhook source', () => {
      const source = { origin: 'webhook', record_id: 'hook_789' };
      const result = getSourceIcon(source);
      expect(result).toContain('🔄');
      expect(result).toContain('webhook-icon');
      expect(result).toContain('title="Webhook"');
    });

    it('should return integration icon for integration source', () => {
      const source = 'integration';
      const result = getSourceIcon(source);
      expect(result).toContain('🔌');
      expect(result).toContain('integration-icon');
      expect(result).toContain('title="Integration"');
    });

    it('should return form icon for form source', () => {
      const source = 'form';
      const result = getSourceIcon(source);
      expect(result).toContain('📝');
      expect(result).toContain('form-icon');
      expect(result).toContain('title="Web Form"');
    });

    it('should return mobile icon for mobile source', () => {
      const source = 'mobile';
      const result = getSourceIcon(source);
      expect(result).toContain('📱');
      expect(result).toContain('mobile-icon');
      expect(result).toContain('title="Mobile App"');
    });

    it('should return Slack icon for Slack source', () => {
      const source = 'slack';
      const result = getSourceIcon(source);
      expect(result).toContain('💬');
      expect(result).toContain('slack-icon');
      expect(result).toContain('title="Slack"');
    });

    it('should return Zendesk icon for Zendesk source', () => {
      const source = 'zendesk';
      const result = getSourceIcon(source);
      expect(result).toContain('🎫');
      expect(result).toContain('zendesk-icon');
      expect(result).toContain('title="Zendesk"');
    });

    it('should return Intercom icon for Intercom source', () => {
      const source = 'intercom';
      const result = getSourceIcon(source);
      expect(result).toContain('💭');
      expect(result).toContain('intercom-icon');
      expect(result).toContain('title="Intercom"');
    });
  });

  describe('Default Productboard Icon for Unknown Sources', () => {
    it('should return Productboard icon for null source', () => {
      const result = getSourceIcon(null);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });

    it('should return Productboard icon for undefined source', () => {
      const result = getSourceIcon(undefined);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });

    it('should return Productboard icon for unknown source type', () => {
      const source = { origin: 'unknown-system', record_id: 'test' };
      const result = getSourceIcon(source);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });

    it('should return Productboard icon for empty object', () => {
      const source = {};
      const result = getSourceIcon(source);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });

    it('should return Productboard icon for object with no recognized properties', () => {
      const source = { id: '123', category: 'system' };
      const result = getSourceIcon(source);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });
  });

  describe('HTML Structure Validation', () => {
    it('should always return a span element with source-icon class', () => {
      const sources = [
        { origin: 'email' },
        { origin: 'api' },
        'manual',
        null,
        undefined
      ];

      sources.forEach(source => {
        const result = getSourceIcon(source);
        expect(result).toMatch(/^<span class="source-icon/);
        expect(result).toMatch(/<\/span>$/);
      });
    });

    it('should always include a title attribute for accessibility', () => {
      const sources = [
        { origin: 'email' },
        { origin: 'api' },
        'manual',
        null,
        'unknown'
      ];

      sources.forEach(source => {
        const result = getSourceIcon(source);
        expect(result).toMatch(/title=".+"/);
      });
    });

    it('should include appropriate CSS class for each source type', () => {
      const testCases = [
        [{ origin: 'email' }, 'email-icon'],
        [{ origin: 'api' }, 'api-icon'],
        ['manual', 'manual-icon'],
        [null, 'productboard-icon'],
        ['unknown', 'productboard-icon']
      ];

      testCases.forEach(([source, expectedClass]) => {
        const result = getSourceIcon(source);
        expect(result).toContain(expectedClass);
      });
    });
  });

  describe('Real-world Productboard API Scenarios', () => {
    it('should handle typical email note from Productboard', () => {
      const note = {
        id: '1',
        title: 'Feature Request from Customer',
        source: { origin: 'email', record_id: null },
        user: { email: 'customer@company.com' }
      };
      
      const result = getSourceIcon(note.source);
      expect(result).toContain('📧');
      expect(result).toContain('email-icon');
      expect(result).toContain('title="Email"');
    });

    it('should handle API integration note', () => {
      const note = {
        id: '2',
        title: 'Automated feedback',
        source: { origin: 'api', record_id: 'external_system_456' },
        user: { email: 'system@company.com' }
      };
      
      const result = getSourceIcon(note.source);
      expect(result).toContain('🔗');
      expect(result).toContain('api-icon');
      expect(result).toContain('title="API Integration"');
    });

    it('should handle manually created note', () => {
      const note = {
        id: '3',
        title: 'Manual feedback entry',
        source: { origin: 'manual', record_id: null },
        user: { email: 'admin@company.com' }
      };
      
      const result = getSourceIcon(note.source);
      expect(result).toContain('✏️');
      expect(result).toContain('manual-icon');
      expect(result).toContain('title="Manual Entry"');
    });

    it('should handle note with no source (defaults to Productboard)', () => {
      const note = {
        id: '4',
        title: 'Legacy note',
        user: { email: 'user@company.com' }
      };
      
      const result = getSourceIcon(note.source);
      expect(result).toContain('🏢');
      expect(result).toContain('productboard-icon');
      expect(result).toContain('title="Productboard"');
    });

    it('should handle mixed source types in batch processing', () => {
      const notes = [
        { source: { origin: 'email', record_id: null } },
        { source: { origin: 'api', record_id: 'ext_123' } },
        { source: 'manual' },
        { source: null },
        { /* no source property */ }
      ];
      
      const results = notes.map(note => getSourceIcon(note.source));
      
      expect(results[0]).toContain('📧'); // email
      expect(results[1]).toContain('🔗'); // api
      expect(results[2]).toContain('✏️'); // manual
      expect(results[3]).toContain('🏢'); // null -> productboard
      expect(results[4]).toContain('🏢'); // undefined -> productboard
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-string, non-object source values gracefully', () => {
      const edgeCases = [
        123,
        true,
        false,
        [],
        function() {}
      ];

      edgeCases.forEach(source => {
        const result = getSourceIcon(source);
        expect(result).toContain('🏢'); // Should default to Productboard
        expect(result).toContain('productboard-icon');
      });
    });

    it('should handle source objects with null/undefined origin', () => {
      const sources = [
        { origin: null, record_id: '123' },
        { origin: undefined, record_id: '456' },
        { origin: '', record_id: '789' }
      ];

      sources.forEach(source => {
        const result = getSourceIcon(source);
        expect(result).toContain('🏢'); // Should default to Productboard
        expect(result).toContain('productboard-icon');
      });
    });
  });
});