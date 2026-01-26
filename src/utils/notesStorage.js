// Storage utility for sticky notes
const NOTES_KEY = 'workspace_sticky_notes';

export const notesStorage = {
    // Get all notes
    get: () => {
        try {
            const notes = localStorage.getItem(NOTES_KEY);
            return notes ? JSON.parse(notes) : [];
        } catch (error) {
            console.error('Error reading notes:', error);
            return [];
        }
    },

    // Save all notes
    set: (notes) => {
        try {
            localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    },

    // Add a new note
    add: (note) => {
        const notes = notesStorage.get();
        const newNote = {
            id: Date.now().toString(),
            content: note.content || '',
            color: note.color || '#ffd93d',
            createdAt: new Date().toISOString(),
            ...note
        };
        notes.push(newNote);
        notesStorage.set(notes);
        return newNote;
    },

    // Update a note
    update: (id, updates) => {
        const notes = notesStorage.get();
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...updates };
            notesStorage.set(notes);
            return notes[index];
        }
        return null;
    },

    // Delete a note
    delete: (id) => {
        const notes = notesStorage.get();
        const filtered = notes.filter(note => note.id !== id);
        notesStorage.set(filtered);
        return filtered;
    }
};
