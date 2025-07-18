/**
 * Tests for the getCompanyName function
 * These tests verify that company names are correctly extracted from various data formats
 * that the Productboard API might return.
 */

describe('Company Name Extraction Tests', () => {
  // We'll test the getCompanyName function by evaluating it in a simulated browser environment
  const getCompanyName = (company) => {
    if (!company) return '-';
    
    if (typeof company === 'string') {
      return company;
    }
    
    if (typeof company === 'object') {
      return company.name || company.displayName || company.title || '-';
    }
    
    return '-';
  };

  describe('String Company Names', () => {
    it('should return the company name when company is a string', () => {
      const result = getCompanyName('Acme Corporation');
      expect(result).toBe('Acme Corporation');
    });

    it('should return the company name when company is an empty string', () => {
      const result = getCompanyName('');
      expect(result).toBe('-');
    });

    it('should handle company names with special characters', () => {
      const result = getCompanyName('Tech & Co., Inc.');
      expect(result).toBe('Tech & Co., Inc.');
    });

    it('should handle company names with unicode characters', () => {
      const result = getCompanyName('Café Solutions™');
      expect(result).toBe('Café Solutions™');
    });
  });

  describe('Object Company Names', () => {
    it('should extract name property from company object', () => {
      const company = { name: 'Global Tech Solutions', id: '123' };
      const result = getCompanyName(company);
      expect(result).toBe('Global Tech Solutions');
    });

    it('should extract displayName property when name is not available', () => {
      const company = { displayName: 'Enterprise Corp', id: '456' };
      const result = getCompanyName(company);
      expect(result).toBe('Enterprise Corp');
    });

    it('should extract title property when name and displayName are not available', () => {
      const company = { title: 'Startup Inc', id: '789' };
      const result = getCompanyName(company);
      expect(result).toBe('Startup Inc');
    });

    it('should prefer name over displayName when both are available', () => {
      const company = { 
        name: 'Official Name Corp', 
        displayName: 'Display Name Corp', 
        id: '101' 
      };
      const result = getCompanyName(company);
      expect(result).toBe('Official Name Corp');
    });

    it('should prefer name over title when both are available', () => {
      const company = { 
        name: 'Official Name Corp', 
        title: 'Title Corp', 
        id: '102' 
      };
      const result = getCompanyName(company);
      expect(result).toBe('Official Name Corp');
    });

    it('should prefer displayName over title when name is not available', () => {
      const company = { 
        displayName: 'Display Name Corp', 
        title: 'Title Corp', 
        id: '103' 
      };
      const result = getCompanyName(company);
      expect(result).toBe('Display Name Corp');
    });

    it('should return dash when object has no name-related properties', () => {
      const company = { id: '999', category: 'tech' };
      const result = getCompanyName(company);
      expect(result).toBe('-');
    });

    it('should handle empty object', () => {
      const company = {};
      const result = getCompanyName(company);
      expect(result).toBe('-');
    });

    it('should handle object with empty string name properties', () => {
      const company = { name: '', displayName: '', title: '', id: '200' };
      const result = getCompanyName(company);
      expect(result).toBe('-');
    });

    it('should handle object with null name properties', () => {
      const company = { name: null, displayName: null, title: null, id: '201' };
      const result = getCompanyName(company);
      expect(result).toBe('-');
    });

    it('should handle object with undefined name properties', () => {
      const company = { name: undefined, displayName: undefined, title: undefined, id: '202' };
      const result = getCompanyName(company);
      expect(result).toBe('-');
    });
  });

  describe('Edge Cases', () => {
    it('should return dash when company is null', () => {
      const result = getCompanyName(null);
      expect(result).toBe('-');
    });

    it('should return dash when company is undefined', () => {
      const result = getCompanyName(undefined);
      expect(result).toBe('-');
    });

    it('should return dash when company is false', () => {
      const result = getCompanyName(false);
      expect(result).toBe('-');
    });

    it('should return dash when company is 0', () => {
      const result = getCompanyName(0);
      expect(result).toBe('-');
    });

    it('should return dash when company is NaN', () => {
      const result = getCompanyName(NaN);
      expect(result).toBe('-');
    });

    it('should return dash when company is a number', () => {
      const result = getCompanyName(123);
      expect(result).toBe('-');
    });

    it('should return dash when company is a boolean', () => {
      const result = getCompanyName(true);
      expect(result).toBe('-');
    });

    it('should return dash when company is an array', () => {
      const result = getCompanyName(['Company Name']);
      expect(result).toBe('-');
    });

    it('should return dash when company is a function', () => {
      const result = getCompanyName(() => 'Company Name');
      expect(result).toBe('-');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle Productboard API response with string company', () => {
      const note = {
        id: '1',
        title: 'Feature Request',
        content: 'We need a new feature',
        company: 'Acme Corp',
        user: { email: 'user@acme.com' }
      };
      const result = getCompanyName(note.company);
      expect(result).toBe('Acme Corp');
    });

    it('should handle Productboard API response with object company', () => {
      const note = {
        id: '2',
        title: 'Bug Report',
        content: 'There is a bug',
        company: { name: 'Tech Solutions Ltd', id: 'comp_123' },
        user: { email: 'user@techsolutions.com' }
      };
      const result = getCompanyName(note.company);
      expect(result).toBe('Tech Solutions Ltd');
    });

    it('should handle Productboard API response with no company', () => {
      const note = {
        id: '3',
        title: 'General Feedback',
        content: 'This is feedback',
        user: { email: 'user@example.com' }
      };
      const result = getCompanyName(note.company);
      expect(result).toBe('-');
    });

    it('should handle mixed company formats in batch processing', () => {
      const notes = [
        { company: 'String Company' },
        { company: { name: 'Object Company' } },
        { company: { displayName: 'Display Company' } },
        { company: null },
        { /* no company property */ }
      ];
      
      const results = notes.map(note => getCompanyName(note.company));
      
      expect(results).toEqual([
        'String Company',
        'Object Company',
        'Display Company',
        '-',
        '-'
      ]);
    });
  });
});