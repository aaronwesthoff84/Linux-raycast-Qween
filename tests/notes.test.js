const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Create test directory
const testDir = '/tmp/test-linuxcast';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Mock electron app before importing NotesService
const mockApp = {
  getPath: (key) => {
    if (key === 'userData') return testDir;
    return '/tmp';
  }
};

// Override require for electron
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'electron') {
    return { app: mockApp };
  }
  return originalRequire.apply(this, arguments);
};

const NotesService = require('../electron/services/NotesService');

describe('NotesService', () => {
  let notesService;

  beforeEach(() => {
    // Clean up test data
    const dbPath = path.join(testDir, 'notes.json');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    notesService = new NotesService();
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const note = await notesService.createNote('Test Note', 'Test content');
      assert.strictEqual(note.title, 'Test Note');
      assert.strictEqual(note.content, 'Test content');
      assert.ok(note.id);
      assert.ok(note.createdAt);
      assert.ok(note.updatedAt);
    });
  });

  describe('getNotes', () => {
    it('should return all notes when no query', async () => {
      await notesService.createNote('Note 1', 'Content 1');
      await notesService.createNote('Note 2', 'Content 2');
      // Reload to get fresh data from disk
      notesService.loadNotes();
      
      const allNotes = notesService.getNotes('');
      assert.strictEqual(allNotes.length, 2);
    });

    it('should filter notes by title', async () => {
      await notesService.createNote('Important Note', 'Some content');
      await notesService.createNote('Other Note', 'Different content');
      notesService.loadNotes();
      
      const filtered = notesService.getNotes('important');
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].title, 'Important Note');
    });

    it('should filter notes by content', async () => {
      await notesService.createNote('Note A', 'Contains secret');
      await notesService.createNote('Note B', 'Regular content');
      notesService.loadNotes();
      
      const filtered = notesService.getNotes('secret');
      assert.strictEqual(filtered.length, 1);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const note = await notesService.createNote('Original', 'Original content');
      // Wait a tiny bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      const updated = await notesService.updateNote(note.id, { 
        title: 'Updated', 
        content: 'New content' 
      });
      
      assert.strictEqual(updated.title, 'Updated');
      assert.strictEqual(updated.content, 'New content');
      assert.ok(updated.updatedAt >= note.updatedAt);
    });

    it('should return null for non-existent note', async () => {
      const result = await notesService.updateNote('nonexistent', { title: 'Test' });
      assert.strictEqual(result, null);
    });
  });

  describe('deleteNote', () => {
    it('should delete an existing note', async () => {
      const note = await notesService.createNote('To Delete', 'Content');
      // Reload to ensure we have fresh data
      notesService.loadNotes();
      const deleted = await notesService.deleteNote(note.id);
      
      assert.strictEqual(deleted, true);
      
      // Reload notes after deletion
      notesService.loadNotes();
      const remaining = notesService.getNotes('');
      assert.strictEqual(remaining.length, 0);
    });

    it('should return false for non-existent note', async () => {
      const result = await notesService.deleteNote('nonexistent');
      assert.strictEqual(result, false);
    });
  });
});

console.log('✓ NotesService tests defined');
