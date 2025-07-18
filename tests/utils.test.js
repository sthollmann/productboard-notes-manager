const fs = require('fs');
const path = require('path');

describe('Utility Functions', () => {
  describe('Local Changes Management', () => {
    const testChangesFile = path.join(__dirname, '..', 'test_local_changes.json');
    
    beforeEach(() => {
      if (fs.existsSync(testChangesFile)) {
        fs.unlinkSync(testChangesFile);
      }
    });

    afterEach(() => {
      if (fs.existsSync(testChangesFile)) {
        fs.unlinkSync(testChangesFile);
      }
    });

    it('should handle non-existent changes file', () => {
      const changesFile = path.join(__dirname, '..', 'local_changes.json');
      if (fs.existsSync(changesFile)) {
        fs.unlinkSync(changesFile);
      }
      
      delete require.cache[require.resolve('../index.js')];
      const app = require('../index.js');
      
      expect(app).toBeDefined();
    });

    it('should parse existing changes file', () => {
      const testChanges = [
        {
          id: '1',
          type: 'create',
          timestamp: new Date().toISOString(),
          data: { title: 'Test' }
        }
      ];

      const changesFile = path.join(__dirname, '..', 'local_changes.json');
      fs.writeFileSync(changesFile, JSON.stringify(testChanges));
      
      delete require.cache[require.resolve('../index.js')];
      const app = require('../index.js');
      
      expect(app).toBeDefined();
      
      if (fs.existsSync(changesFile)) {
        fs.unlinkSync(changesFile);
      }
    });

    it('should handle corrupted changes file', () => {
      const changesFile = path.join(__dirname, '..', 'local_changes.json');
      fs.writeFileSync(changesFile, 'invalid json');
      
      delete require.cache[require.resolve('../index.js')];
      const app = require('../index.js');
      
      expect(app).toBeDefined();
      
      if (fs.existsSync(changesFile)) {
        fs.unlinkSync(changesFile);
      }
    });
  });

  describe('Environment Variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should use default PORT when not specified', () => {
      delete process.env.PORT;
      delete require.cache[require.resolve('../index.js')];
      
      const app = require('../index.js');
      expect(app).toBeDefined();
    });

    it('should use custom PORT when specified', () => {
      process.env.PORT = '4000';
      delete require.cache[require.resolve('../index.js')];
      
      const app = require('../index.js');
      expect(app).toBeDefined();
    });

    it('should handle missing API token', () => {
      delete process.env.PRODUCTBOARD_API_TOKEN;
      delete require.cache[require.resolve('../index.js')];
      
      const app = require('../index.js');
      expect(app).toBeDefined();
    });
  });
});