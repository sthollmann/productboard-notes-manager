const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const PRODUCTBOARD_API_BASE = 'https://api.productboard.com';
const API_TOKEN = process.env.PRODUCTBOARD_API_TOKEN;

const apiClient = axios.create({
  baseURL: PRODUCTBOARD_API_BASE,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'X-Version': '1',
    'Content-Type': 'application/json'
  }
});

let localChanges = [];

// Load existing local changes on startup
const changesFilePath = path.join(__dirname, 'local_changes.json');
try {
  if (fs.existsSync(changesFilePath)) {
    const changesData = fs.readFileSync(changesFilePath, 'utf8');
    localChanges = JSON.parse(changesData);
    console.log(`Loaded ${localChanges.length} local changes from ${changesFilePath}`);
  } else {
    console.log('No existing local changes file found, starting with empty changes array');
    localChanges = [];
  }
} catch (error) {
  console.error('Error loading local changes:', error);
  localChanges = [];
}

function saveLocalChanges() {
  try {
    const filePath = path.join(__dirname, 'local_changes.json');
    fs.writeFileSync(filePath, JSON.stringify(localChanges, null, 2));
    console.log(`Saved ${localChanges.length} local changes to ${filePath}`);
  } catch (error) {
    console.error('Error saving local changes:', error);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/notes', async (req, res) => {
  try {
    const response = await apiClient.get('/notes');
    
    // Enrich notes with company information
    if (response.data && response.data.data && response.data.data.length > 0) {
      const enrichedNotes = await enrichNotesWithCompanyNames(response.data.data);
      response.data.data = enrichedNotes;
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching notes:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch notes from Productboard API' });
  }
});

async function enrichNotesWithCompanyNames(notes) {
  // Extract unique company IDs
  const companyIds = new Set();
  notes.forEach(note => {
    if (note.company && note.company.id) {
      companyIds.add(note.company.id);
    }
  });
  
  // Fetch company details for all unique IDs
  const companyCache = {};
  const companyPromises = Array.from(companyIds).map(async (companyId) => {
    try {
      const companyResponse = await apiClient.get(`/companies/${companyId}`);
      companyCache[companyId] = companyResponse.data.data;
    } catch (error) {
      console.error(`Error fetching company ${companyId}:`, error.response?.data || error.message);
      // Keep the original company object if fetching fails
      companyCache[companyId] = null;
    }
  });
  
  // Wait for all company requests to complete
  await Promise.all(companyPromises);
  
  // Enrich notes with company information
  const enrichedNotes = notes.map(note => {
    if (note.company && note.company.id && companyCache[note.company.id]) {
      const companyData = companyCache[note.company.id];
      return {
        ...note,
        company: {
          id: note.company.id,
          name: companyData.name,
          domain: companyData.domain,
          description: companyData.description
        }
      };
    }
    return note;
  });
  
  return enrichedNotes;
}

app.post('/api/notes', async (req, res) => {
  try {
    const noteData = req.body;
    
    const change = {
      id: Date.now().toString(),
      type: 'create',
      timestamp: new Date().toISOString(),
      data: noteData,
      originalData: null
    };
    
    const response = await apiClient.post('/notes', noteData);
    
    change.remoteId = response.data.data.id;
    localChanges.push(change);
    saveLocalChanges();
    
    res.json(response.data);
  } catch (error) {
    console.error('Error creating note:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const noteData = req.body;
    
    const originalResponse = await apiClient.get(`/notes/${noteId}`);
    
    const change = {
      id: Date.now().toString(),
      type: 'update',
      timestamp: new Date().toISOString(),
      remoteId: noteId,
      data: noteData,
      originalData: originalResponse.data.data
    };
    
    const response = await apiClient.put(`/notes/${noteId}`, noteData);
    
    localChanges.push(change);
    saveLocalChanges();
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating note:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    
    const originalResponse = await apiClient.get(`/notes/${noteId}`);
    
    const change = {
      id: Date.now().toString(),
      type: 'delete',
      timestamp: new Date().toISOString(),
      remoteId: noteId,
      data: null,
      originalData: originalResponse.data.data
    };
    
    const response = await apiClient.delete(`/notes/${noteId}`);
    
    localChanges.push(change);
    saveLocalChanges();
    
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting note:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Tag-specific operations
app.post('/api/notes/:id/tags/:tagName', async (req, res) => {
  try {
    const noteId = req.params.id;
    const tagName = req.params.tagName;
    
    // Get the current note data for tracking
    const originalResponse = await apiClient.get(`/notes/${noteId}`);
    
    // Add the tag using Productboard's tag-specific endpoint
    const response = await apiClient.post(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`);
    
    // Get the updated note data
    const updatedResponse = await apiClient.get(`/notes/${noteId}`);
    
    // Track the change
    const change = {
      id: Date.now().toString(),
      type: 'tag_add',
      timestamp: new Date().toISOString(),
      remoteId: noteId,
      data: { tagName: tagName },
      originalData: originalResponse.data.data,
      updatedData: updatedResponse.data.data
    };
    
    localChanges.push(change);
    saveLocalChanges();
    
    res.json(updatedResponse.data);
  } catch (error) {
    console.error('Error adding tag to note:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to add tag to note' });
  }
});

app.delete('/api/notes/:id/tags/:tagName', async (req, res) => {
  try {
    const noteId = req.params.id;
    const tagName = req.params.tagName;
    
    // Get the current note data for tracking
    const originalResponse = await apiClient.get(`/notes/${noteId}`);
    
    // Remove the tag using Productboard's tag-specific endpoint
    const response = await apiClient.delete(`/notes/${noteId}/tags/${encodeURIComponent(tagName)}`);
    
    // Get the updated note data
    const updatedResponse = await apiClient.get(`/notes/${noteId}`);
    
    // Track the change
    const change = {
      id: Date.now().toString(),
      type: 'tag_remove',
      timestamp: new Date().toISOString(),
      remoteId: noteId,
      data: { tagName: tagName },
      originalData: originalResponse.data.data,
      updatedData: updatedResponse.data.data
    };
    
    localChanges.push(change);
    saveLocalChanges();
    
    res.json(updatedResponse.data);
  } catch (error) {
    console.error('Error removing tag from note:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to remove tag from note' });
  }
});

app.get('/api/changes', (req, res) => {
  res.json(localChanges);
});

app.post('/api/rollback/:changeId', async (req, res) => {
  try {
    const changeId = req.params.changeId;
    const change = localChanges.find(c => c.id === changeId);
    
    if (!change) {
      return res.status(404).json({ error: 'Change not found' });
    }
    
    let rollbackResult;
    
    switch (change.type) {
      case 'create':
        rollbackResult = await apiClient.delete(`/notes/${change.remoteId}`);
        break;
      case 'update':
        rollbackResult = await apiClient.put(`/notes/${change.remoteId}`, change.originalData);
        break;
      case 'delete':
        rollbackResult = await apiClient.post('/notes', change.originalData);
        break;
      case 'tag_add':
        // To rollback a tag addition, we need to remove the tag
        rollbackResult = await apiClient.delete(`/notes/${change.remoteId}/tags/${encodeURIComponent(change.data.tagName)}`);
        break;
      case 'tag_remove':
        // To rollback a tag removal, we need to add the tag back
        rollbackResult = await apiClient.post(`/notes/${change.remoteId}/tags/${encodeURIComponent(change.data.tagName)}`);
        break;
    }
    
    localChanges = localChanges.filter(c => c.id !== changeId);
    saveLocalChanges();
    
    res.json({ success: true, rollbackResult: rollbackResult.data });
  } catch (error) {
    console.error('Error rolling back change:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to rollback change' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;