const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class NotesService {
  constructor() {
    this.notes = [];
    this.dbPath = path.join(app.getPath('userData'), 'notes.json');
    this.loadNotes();
  }

  async loadNotes() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      this.notes = JSON.parse(data);
    } catch (e) {
      this.notes = [];
    }
  }

  async saveNotes() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.notes, null, 2));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }

  async createNote(title, content) {
    const note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.notes.unshift(note);
    await this.saveNotes();
    return note;
  }

  async updateNote(id, updates) {
    const index = this.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updatedAt: Date.now()
      };
      await this.saveNotes();
      return this.notes[index];
    }
    return null;
  }

  async deleteNote(id) {
    const index = this.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      await this.saveNotes();
      return true;
    }
    return false;
  }

  getNotes(query = '') {
    if (!query.trim()) {
      return this.notes;
    }
    const q = query.toLowerCase();
    return this.notes.filter(
      n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }

  getNote(id) {
    return this.notes.find(n => n.id === id);
  }
}

module.exports = NotesService;
