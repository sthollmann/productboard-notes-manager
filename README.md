# Productboard Notes Manager

A Node.js application for managing Productboard Notes with local change tracking and rollback functionality.

## Features

- **Notes Management**: Create, read, update, and delete notes via Productboard API
- **Local Change Tracking**: All modifications are tracked locally with timestamps
- **Rollback Functionality**: Undo any change made through the application
- **Web Interface**: Clean table view for displaying notes with company, title, source, owner, and tags
- **API Integration**: Full integration with Productboard's REST API

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Productboard API token (Pro plan or higher required)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sthollmann/productboard-notes-manager.git
cd productboard-notes-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Productboard API token
```

4. Start the application:
```bash
npm start
```

5. Open your browser to `http://localhost:3000`

## Configuration

Create a `.env` file in the root directory:

```
PRODUCTBOARD_API_TOKEN=your_productboard_api_token_here
PORT=3000
```

## Usage

### Web Interface

1. **View Notes**: Navigate to the main page to see all notes in a table format
2. **Create Notes**: Use the "Create Note" tab to add new notes
3. **Edit/Delete**: Use the action buttons in the table to modify or remove notes
4. **View Changes**: Check the "Local Changes" tab to see all tracked modifications
5. **Rollback**: Use the rollback button next to any change to undo it

### API Endpoints

- `GET /api/notes` - Fetch all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/changes` - Get local changes
- `POST /api/rollback/:changeId` - Rollback a specific change

## Testing

The application includes comprehensive automated tests with 90%+ coverage.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage

- **Statements**: 90.69%
- **Branches**: 57.89%
- **Functions**: 81.81%
- **Lines**: 90.47%

## Development

### Project Structure

```
├── index.js                 # Main application server
├── public/
│   └── index.html          # Web interface
├── tests/
│   ├── final.test.js       # Comprehensive test suite
│   ├── utils.test.js       # Utility function tests
│   └── setup.js            # Test configuration
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
├── coverage/               # Test coverage reports
├── local_changes.json      # Local changes storage (auto-generated)
└── README.md
```

### Key Components

- **Express Server**: Handles HTTP requests and serves the web interface
- **Productboard API Client**: Manages communication with Productboard's API
- **Change Tracking**: Records all modifications for rollback capability
- **Web Interface**: Single-page application with tabbed navigation

### Adding New Features

1. **Write Tests First**: Follow TDD approach
2. **Implement Feature**: Add the functionality
3. **Verify Coverage**: Ensure tests pass and coverage remains high
4. **Update Documentation**: Keep README and docs current

## Deployment

### Environment Variables

Set these in your production environment:

- `PRODUCTBOARD_API_TOKEN`: Your Productboard API token
- `PORT`: Port to run the server on (default: 3000)
- `NODE_ENV`: Set to 'production' for production deployment

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Write tests for your changes
4. Implement the feature
5. Run tests: `npm test`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the test documentation for API usage examples
- Review the Productboard API documentation: https://developer.productboard.com/

## Changelog

### v1.0.0 (Initial Release)
- ✅ Complete Productboard API integration
- ✅ Local change tracking and rollback functionality
- ✅ Web interface with table view
- ✅ Comprehensive test suite (90%+ coverage)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Complete documentation