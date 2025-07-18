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

try {
  const changesData = fs.readFileSync(path.join(__dirname, 'local_changes.json'), 'utf8');
  localChanges = JSON.parse(changesData);
} catch (error) {
  localChanges = [];
}

function saveLocalChanges() {
  fs.writeFileSync(path.join(__dirname, 'local_changes.json'), JSON.stringify(localChanges, null, 2));
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