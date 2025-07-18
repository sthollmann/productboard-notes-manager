# Test Documentation

## Overview

This document provides comprehensive information about the testing setup, test coverage, and how to run tests for the Productboard Notes Manager application.

## Test Framework

- **Test Framework**: Jest
- **HTTP Testing**: Supertest
- **API Mocking**: Nock
- **Coverage Target**: 90% minimum across all metrics

## Test Structure

```
tests/
├── setup.js              # Test configuration and global setup
├── api.test.js           # API endpoint tests
├── utils.test.js         # Utility function tests
└── integration.test.js   # End-to-end integration tests
```

## Test Coverage

Our tests cover the following areas:

### 1. API Endpoints (api.test.js)
- **GET /**: Serves main HTML page
- **GET /api/notes**: Fetches notes from Productboard API
- **POST /api/notes**: Creates new notes
- **PUT /api/notes/:id**: Updates existing notes
- **DELETE /api/notes/:id**: Deletes notes
- **GET /api/changes**: Retrieves local changes
- **POST /api/rollback/:changeId**: Rollback operations

### 2. Utility Functions (utils.test.js)
- Local changes file management
- Environment variable handling
- Error handling for corrupted files
- Default configuration handling

### 3. Integration Tests (integration.test.js)
- Complete note lifecycle (create → update → delete → rollback)
- Bulk operations
- Static file serving
- API authentication
- Error handling and recovery
- Network timeout handling

## Running Tests

### Manual Test Execution

#### Run all tests
```bash
npm test
```

#### Run tests with coverage report
```bash
npm run test:coverage
```

#### Run tests in watch mode (for development)
```bash
npm run test:watch
```

#### Run tests for CI/CD (no watch, with coverage)
```bash
npm run test:ci
```

### Test Scripts Explained

- `npm test`: Runs all tests once
- `npm run test:watch`: Runs tests in watch mode, re-running when files change
- `npm run test:coverage`: Runs tests and generates coverage report
- `npm run test:ci`: Runs tests in CI mode with coverage and no watch

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/index.html`: HTML coverage report (open in browser)
- `coverage/lcov-report/index.html`: Detailed LCOV report
- `coverage/coverage-final.json`: JSON coverage data

### Coverage Thresholds

The following minimum coverage thresholds are enforced:

- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

## Test Environment

### Environment Variables

Tests use the following environment variables:
- `NODE_ENV=test`: Identifies test environment
- `PRODUCTBOARD_API_TOKEN=test-token`: Mock API token for testing

### Test Data

Tests use mock data and don't interact with the real Productboard API. All external API calls are mocked using Nock.

### Test Isolation

Each test:
- Runs in isolation with fresh state
- Cleans up temporary files
- Mocks external dependencies
- Resets the module cache when needed

## Automated Testing

### GitHub Actions (CI/CD)

The project includes GitHub Actions workflow for automated testing:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

To set up pre-commit hooks that run tests before commits:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:ci"
```

### Continuous Integration

The CI pipeline:
1. Runs on every push to main/develop branches
2. Runs on all pull requests
3. Installs dependencies
4. Runs full test suite with coverage
5. Fails if coverage falls below 90%
6. Uploads coverage reports to Codecov

## Test Data Management

### Mock Data

Tests use predefined mock data for consistency:

```javascript
const mockNote = {
  id: '123',
  title: 'Test Note',
  content: 'Test content',
  user: { email: 'test@example.com' },
  company: 'Test Company',
  tags: ['test', 'mock']
};
```

### API Mocking

External API calls are mocked using Nock:

```javascript
nock('https://api.productboard.com')
  .get('/notes')
  .reply(200, { data: [mockNote] });
```

## Troubleshooting

### Common Issues

1. **Tests fail due to port conflicts**
   - Solution: Tests run with `NODE_ENV=test` and don't start the server

2. **Coverage reports not generated**
   - Solution: Run `npm run test:coverage` instead of `npm test`

3. **API mocks not working**
   - Solution: Ensure `nock.cleanAll()` is called in `afterEach`

4. **File system conflicts**
   - Solution: Tests clean up temporary files in `beforeEach`/`afterEach`

### Debug Mode

To run tests in debug mode:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Don't make real API calls
3. **Clean Up**: Always clean up temporary files and state
4. **Descriptive Names**: Use clear, descriptive test names
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Coverage**: Aim for high coverage but focus on meaningful tests

## Adding New Tests

When adding new features:

1. Add unit tests for new functions
2. Add integration tests for new API endpoints
3. Update this documentation
4. Ensure coverage remains above 90%

### Test Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## Performance Testing

For performance testing, consider adding:

- Load testing with Artillery or k6
- Memory leak detection
- Response time monitoring
- Database query performance

## Security Testing

Security considerations:
- Input validation testing
- Authentication testing
- Authorization testing
- XSS prevention testing
- SQL injection prevention (if using database)

## Maintenance

- Review and update tests when adding new features
- Keep test dependencies up to date
- Monitor coverage reports regularly
- Refactor tests when code changes significantly