# Contributing to Productboard Notes Manager

Thank you for your interest in contributing to the Productboard Notes Manager! This document provides guidelines for contributing to the project.

## Development Process

We follow a **Test-Driven Development (TDD)** approach:

1. **Write Tests First** - Always write tests before implementing functionality
2. **Red-Green-Refactor** - Write failing tests, make them pass, then refactor
3. **Maintain Coverage** - Ensure all new code meets the 80%+ coverage thresholds
4. **Test Edge Cases** - Include error handling, boundary conditions, and failure scenarios

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Productboard API token (for testing)

### Local Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/productboard-notes-manager.git
   cd productboard-notes-manager
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your Productboard API token
   ```

5. Run tests to ensure everything works:
   ```bash
   npm test
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Making Changes

### Branch Strategy

- Create a new branch for each feature or bug fix
- Use descriptive branch names:
  - `feature/add-note-filtering`
  - `bugfix/fix-rollback-issue`
  - `docs/update-api-documentation`

### Code Style

- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing Requirements

**All contributions must include tests!**

1. **Write tests first** for any new functionality
2. **Ensure all tests pass**: `npm test`
3. **Maintain coverage**: `npm run test:coverage`
4. **Test edge cases**: Error conditions, boundary values, invalid inputs

#### Test Coverage Requirements

- **Statements**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Branches**: 50% minimum

#### Test Structure

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

## Submitting Changes

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Write tests** for your changes
3. **Implement the feature**
4. **Run the full test suite**: `npm test`
5. **Check test coverage**: `npm run test:coverage`
6. **Update documentation** if needed
7. **Commit your changes** with clear messages
8. **Push to your fork**
9. **Create a pull request**

### Pull Request Guidelines

#### Title Format
- Use clear, descriptive titles
- Start with the type of change:
  - `feat: add note filtering functionality`
  - `fix: resolve rollback issue with deleted notes`
  - `docs: update API documentation`
  - `test: add integration tests for note creation`

#### Description Template
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests have been added for new functionality
- [ ] Test coverage meets minimum requirements
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Code Review Process

1. **Automated checks** must pass (tests, linting, coverage)
2. **Manual review** by maintainers
3. **Address feedback** if requested
4. **Final approval** and merge

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]
- Browser: [e.g. Chrome 91.0]

**Additional Context**
Any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
A clear description of what you want to happen.

**Use Case**
Describe the use case this feature would solve.

**Proposed Solution**
Describe the solution you'd like.

**Alternatives Considered**
Describe any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots about the feature request.
```

## Development Guidelines

### API Changes

- **Backward compatibility**: Avoid breaking existing API endpoints
- **Versioning**: Use API versioning for major changes
- **Documentation**: Update API documentation for any changes

### Database/Storage Changes

- **Migration strategy**: Provide migration path for existing data
- **Backward compatibility**: Ensure old data formats are supported
- **Testing**: Test with existing data structures

### Security Considerations

- **Input validation**: Validate all user inputs
- **Authentication**: Maintain secure authentication patterns
- **API keys**: Never commit API keys or sensitive data
- **Dependencies**: Keep dependencies updated

## Resources

- [Productboard API Documentation](https://developer.productboard.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [Express.js Documentation](https://expressjs.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## Questions?

If you have questions about contributing:

1. Check existing [issues](https://github.com/[YOUR_USERNAME]/productboard-notes-manager/issues)
2. Create a new issue with the "question" label
3. Join the discussion in existing issues

## Recognition

All contributors will be recognized in the project's README and release notes.

Thank you for contributing to Productboard Notes Manager! 🎉