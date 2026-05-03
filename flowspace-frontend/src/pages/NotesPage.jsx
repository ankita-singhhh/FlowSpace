import { useState, useEffect } from 'react';
import { 
  Plus, 
  Pin, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Search, 
  Tag, 
  Link, 
  Eye, 
  EyeOff,
  Palette,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const NOTE_COLORS = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'Green', value: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'Gray', value: 'gray', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900' }
];

export default function NotesPage() {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    color: NOTE_COLORS[0].value,
    isPinned: false,
    linkedTask: null
  });

  // Mock data for demonstration
  const mockNotes = [
    {
      id: 1,
      title: 'Project Meeting Notes',
      content: '# Project Meeting\n\n## Agenda\n1. Review Q1 goals\n2. Discuss new features\n3. Timeline adjustments\n\n## Action Items\n- [ ] Update documentation\n- [ ] Schedule follow-up\n- [ ] Review budget',
      tags: ['meeting', 'project'],
      color: 'blue',
      isPinned: true,
      linkedTask: 'Complete project proposal',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'Ideas for New Features',
      content: '## Feature Ideas\n\n1. **Dark Mode** - User requested\n2. **Export Options** - CSV, PDF\n3. **Mobile App** - React Native\n4. **AI Integration** - ChatGPT API\n\nPriority: High',
      tags: ['ideas', 'features'],
      color: 'green',
      isPinned: false,
      linkedTask: null,
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-14T14:30:00Z'
    },
    {
      id: 3,
      title: 'Learning Resources',
      content: '## React Resources\n- [React Docs](https://react.dev)\n- [Tailwind CSS](https://tailwindcss.com)\n- [Node.js Guide](https://nodejs.org)\n\n## Books to Read\n1. "Clean Code" - Robert Martin\n2. "The Pragmatic Programmer"',
      tags: ['learning', 'resources'],
      color: 'purple',
      isPinned: false,
      linkedTask: null,
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    },
    {
      id: 4,
      title: 'Quick Shopping List',
      content: '## Groceries\n- Milk\n- Eggs\n- Bread\n- Coffee beans\n- Fresh vegetables\n\n## Office Supplies\n- Notebooks\n- Pens\n- Sticky notes',
      tags: ['personal', 'shopping'],
      color: 'amber',
      isPinned: false,
      linkedTask: null,
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-12T16:45:00Z'
    },
    {
      id: 5,
      title: 'Weekend Plans',
      content: '## Saturday\n- Morning: Gym workout\n- Afternoon: Coffee with Sarah\n- Evening: Movie night\n\n## Sunday\n- Morning: Brunch with family\n- Afternoon: Reading time\n- Evening: Prepare for week',
      tags: ['personal', 'weekend'],
      color: 'pink',
      isPinned: false,
      linkedTask: null,
      createdAt: '2024-01-11T20:00:00Z',
      updatedAt: '2024-01-11T20:00:00Z'
    }
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get('/notes');
        setNotes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const getColorClass = (colorValue) => {
    return NOTE_COLORS.find(c => c.value === colorValue) || NOTE_COLORS[5];
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const response = await api.post('/notes', newNote);
      setNotes([response.data, ...notes]);
      setIsAddModalOpen(false);
      setNewNote({
        title: '',
        content: '',
        tags: [],
        color: NOTE_COLORS[0].value,
        isPinned: false,
        linkedTask: null
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = async () => {
    try {
      const response = await api.put(`/notes/${editingNote.id}`, editingNote);
      setNotes(notes.map(n => 
        n.id === editingNote.id ? response.data : n
      ));
      setIsEditModalOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const togglePin = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    try {
      const response = await api.put(`/notes/${noteId}`, { isPinned: !note.isPinned });
      setNotes(notes.map(n => 
        n.id === noteId ? response.data : n
      ));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const getAllTags = () => {
    const allTags = notes.flatMap(n => n.tags);
    return [...new Set(allTags)];
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const renderMarkdown = (content) => {
    // Simple markdown rendering (basic implementation)
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Notes</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Capture your thoughts, ideas, and meeting notes</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isDark ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-cyan-500 text-white hover:bg-cyan-600'
          } transition-colors`}
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
          >
            <option value="">All Tags</option>
            {getAllTags().map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {sortedNotes.map((note) => {
          const colorClass = getColorClass(note.color);
          return (
            <div
              key={note.id}
              className={`break-inside-avoid p-4 rounded-xl border transition-all hover:shadow-lg ${
                isDark ? 'bg-gray-800 border-gray-700' : `${colorClass.bg} ${colorClass.border}`
              } ${note.isPinned ? 'ring-2 ring-cyan-500' : ''}`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {note.isPinned && <Pin size={16} className="text-cyan-500" />}
                  <h3 className={`font-semibold ${isDark ? 'text-white' : colorClass.text}`}>
                    {note.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNote(note)}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Edit3 size={14} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <div className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-6`}>
                {note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-white bg-opacity-60 text-gray-700'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Linked Task Badge */}
              {note.linkedTask && (
                <div className="flex items-center gap-1 mb-3">
                  <Link size={12} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {note.linkedTask}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => togglePin(note.id)}
                  className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <Pin size={12} className={note.isPinned ? 'text-cyan-500' : (isDark ? 'text-gray-400' : 'text-gray-500')} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sortedNotes.length === 0 && (
          <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">📝</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No notes found
            </h3>
            <p>{searchQuery || selectedTag ? 'Try adjusting your search or filters' : 'Start capturing your thoughts and ideas!'}</p>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Note</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Content (Markdown supported)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
                    {isPreviewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {isPreviewMode ? (
                  <div
                    className={`w-full min-h-[200px] p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    } prose prose-sm max-w-none`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(newNote.content) }}
                  />
                ) : (
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your thoughts..."
                    rows={8}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Color
                  </label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewNote({ ...newNote, color: color.value })}
                        className={`w-8 h-8 rounded-lg ${color.bg} ${color.border} ${
                          newNote.color === color.value ? 'ring-2 ring-offset-2 ring-cyan-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newNote.tags.join(', ')}
                    onChange={(e) => setNewNote({ 
                      ...newNote, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., ideas, meeting, to-read"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={newNote.isPinned}
                    onChange={(e) => setNewNote({ ...newNote, isPinned: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm">Pin to top</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={!newNote.title.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    newNote.title.trim()
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-colors`}
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditModalOpen && editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Note</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Content
                </label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={8}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Color
                  </label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setEditingNote({ ...editingNote, color: color.value })}
                        className={`w-8 h-8 rounded-lg ${color.bg} ${color.border} ${
                          editingNote.color === color.value ? 'ring-2 ring-offset-2 ring-cyan-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editingNote.tags.join(', ')}
                    onChange={(e) => setEditingNote({ 
                      ...editingNote, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNote}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                >
                  Update Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
