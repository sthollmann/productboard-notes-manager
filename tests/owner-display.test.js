/**
 * Tests for the getOwnerName function
 * These tests verify that owner names are correctly extracted from various data formats
 * that the Productboard API might return.
 */

describe('Owner Name Extraction Tests', () => {
  // We'll test the getOwnerName function by evaluating it in a simulated browser environment
  const getOwnerName = (note) => {
    // First check if there's an assigned owner
    if (note.owner && note.owner.name) {
      return note.owner.name;
    }
    if (note.owner && note.owner.email) {
      return note.owner.email;
    }
    
    // If no owner, fall back to createdBy (the person who created the note)
    if (note.createdBy) {
      if (note.createdBy.name) {
        return note.createdBy.name;
      }
      if (note.createdBy.email) {
        return note.createdBy.email;
      }
    }
    
    // If no createdBy, try user with email (though user typically only has ID)
    if (note.user && note.user.email) {
      return note.user.email;
    }
    
    return '-';
  };

  describe('Owner Field Priority', () => {
    it('should prefer owner.name when available', () => {
      const note = {
        owner: { name: 'John Doe', email: 'john@example.com' },
        createdBy: { name: 'Jane Smith', email: 'jane@example.com' },
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('John Doe');
    });

    it('should use owner.email when owner.name is not available', () => {
      const note = {
        owner: { email: 'owner@example.com' },
        createdBy: { name: 'Jane Smith', email: 'jane@example.com' },
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('owner@example.com');
    });

    it('should fall back to createdBy.name when no owner', () => {
      const note = {
        owner: null,
        createdBy: { name: 'Jane Smith', email: 'jane@example.com' },
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Jane Smith');
    });

    it('should fall back to createdBy.email when no owner and no createdBy.name', () => {
      const note = {
        owner: null,
        createdBy: { email: 'jane@example.com' },
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('jane@example.com');
    });

    it('should fall back to user.email when no owner and no createdBy', () => {
      const note = {
        owner: null,
        createdBy: null,
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('user@example.com');
    });

    it('should return dash when no owner information is available', () => {
      const note = {
        owner: null,
        createdBy: null,
        user: { id: '12345' } // user without email
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });
  });

  describe('Empty and Null Handling', () => {
    it('should handle empty owner object', () => {
      const note = {
        owner: {},
        createdBy: { name: 'Jane Smith' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Jane Smith');
    });

    it('should handle empty createdBy object', () => {
      const note = {
        owner: null,
        createdBy: {},
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('user@example.com');
    });

    it('should handle empty user object', () => {
      const note = {
        owner: null,
        createdBy: null,
        user: {}
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });

    it('should handle note with no owner-related fields', () => {
      const note = {
        id: '123',
        title: 'Test Note',
        content: 'Test content'
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });

    it('should handle null values in owner fields', () => {
      const note = {
        owner: { name: null, email: null },
        createdBy: { name: null, email: null },
        user: { email: null }
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });

    it('should handle empty string values in owner fields', () => {
      const note = {
        owner: { name: '', email: '' },
        createdBy: { name: '', email: '' },
        user: { email: '' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });
  });

  describe('Real-world Productboard API Scenarios', () => {
    it('should handle typical note with assigned owner', () => {
      const note = {
        id: '1',
        title: 'Feature Request',
        owner: {
          id: 'owner123',
          name: 'Product Manager',
          email: 'pm@company.com'
        },
        createdBy: {
          id: 'user456',
          name: 'Customer Success',
          email: 'cs@company.com'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Product Manager');
    });

    it('should handle note with no owner but createdBy information', () => {
      const note = {
        id: '2',
        title: 'Bug Report',
        owner: null,
        createdBy: {
          id: '5cc17d7d-742d-459a-9667-563970438360',
          name: 'Carsten Stobwasser',
          email: 'carsten.stobwasser@aeb.com'
        },
        user: {
          id: '989b0053-ab50-438c-9af3-6b6b1feecc03'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Carsten Stobwasser');
    });

    it('should handle note with user that only has ID (typical API response)', () => {
      const note = {
        id: '3',
        title: 'Customer Feedback',
        owner: null,
        createdBy: null,
        user: {
          id: '989b0053-ab50-438c-9af3-6b6b1feecc03'
          // No email field, which is typical for Productboard API
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('-');
    });

    it('should handle legacy note format with user email', () => {
      const note = {
        id: '4',
        title: 'Legacy Note',
        owner: null,
        createdBy: null,
        user: {
          id: 'legacy123',
          email: 'legacy@example.com'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('legacy@example.com');
    });

    it('should handle mixed scenarios in batch processing', () => {
      const notes = [
        { owner: { name: 'Owner Name' }, createdBy: { name: 'Creator' } },
        { owner: null, createdBy: { name: 'Creator Only' } },
        { owner: null, createdBy: { email: 'creator@example.com' } },
        { owner: null, createdBy: null, user: { email: 'user@example.com' } },
        { owner: null, createdBy: null, user: { id: '123' } }
      ];
      
      const results = notes.map(note => getOwnerName(note));
      
      expect(results).toEqual([
        'Owner Name',
        'Creator Only',
        'creator@example.com',
        'user@example.com',
        '-'
      ]);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle owner with only ID', () => {
      const note = {
        owner: { id: 'owner123' },
        createdBy: { name: 'Fallback Name' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Fallback Name');
    });

    it('should handle createdBy with only ID', () => {
      const note = {
        owner: null,
        createdBy: { id: 'creator123' },
        user: { email: 'user@example.com' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('user@example.com');
    });

    it('should handle malformed owner objects', () => {
      const note = {
        owner: 'not-an-object',
        createdBy: { name: 'Valid Creator' }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Valid Creator');
    });

    it('should handle special characters in names', () => {
      const note = {
        owner: {
          name: 'José María García-López',
          email: 'jose@example.com'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('José María García-López');
    });

    it('should handle very long names', () => {
      const note = {
        owner: {
          name: 'This Is A Very Long Name That Might Cause Display Issues But Should Still Be Handled Correctly',
          email: 'long@example.com'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('This Is A Very Long Name That Might Cause Display Issues But Should Still Be Handled Correctly');
    });

    it('should prefer name over email even when email is longer', () => {
      const note = {
        owner: {
          name: 'Bob',
          email: 'very.long.email.address.that.is.much.longer.than.the.name@company.com'
        }
      };
      const result = getOwnerName(note);
      expect(result).toBe('Bob');
    });
  });

  describe('Truthy/Falsy Value Handling', () => {
    it('should handle falsy name values correctly', () => {
      const falsyValues = [null, undefined, '', 0, false];
      
      falsyValues.forEach(falsyValue => {
        const note = {
          owner: { name: falsyValue, email: 'backup@example.com' },
          createdBy: { name: 'Creator' }
        };
        
        const result = getOwnerName(note);
        expect(result).toBe('backup@example.com');
      });
    });

    it('should handle falsy email values correctly', () => {
      const falsyValues = [null, undefined, '', 0, false];
      
      falsyValues.forEach(falsyValue => {
        const note = {
          owner: { name: falsyValue, email: falsyValue },
          createdBy: { name: 'Creator Fallback' }
        };
        
        const result = getOwnerName(note);
        expect(result).toBe('Creator Fallback');
      });
    });
  });
});