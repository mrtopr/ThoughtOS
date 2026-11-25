// LocalStorage-based storage for managing all workspace data

const STORAGE_KEYS = {
  links: 'thoughtos_links',
  projects: 'thoughtos_projects',
  blog: 'thoughtos_blog_posts',
  prompts: 'thoughtos_prompts',
  videos: 'thoughtos_videos'
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

const readCollection = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const writeCollection = (key, items, type = 'all') => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('workspaceDataUpdated', { detail: { type } }));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    throw error;
  }
};

// Links Management
export const linksStorage = {
  getAll: async () => {
    const items = readCollection(STORAGE_KEYS.links);
    return items
      .map(link => ({
        ...link,
        name: link.name || link.title,
        title: link.title || link.name
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  add: async (link) => {
    const items = readCollection(STORAGE_KEYS.links);
    const now = new Date().toISOString();
    const newItem = {
      id: generateId(),
      title: link.name || link.title,
      name: link.name || link.title,
      url: link.url,
      category: link.category || 'Other',
      description: link.description || '',
      workspace_id: link.workspace_id || null,
      created_at: now,
      updated_at: now
    };
    items.unshift(newItem);
    writeCollection(STORAGE_KEYS.links, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = readCollection(STORAGE_KEYS.links);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Link not found');

    const updated = {
      ...items[index],
      ...updates,
      title: updates.name || updates.title || items[index].title,
      name: updates.name || updates.title || items[index].name,
      updated_at: new Date().toISOString()
    };
    items[index] = updated;
    writeCollection(STORAGE_KEYS.links, items);
    return updated;
  },

  delete: async (id) => {
    const items = readCollection(STORAGE_KEYS.links);
    writeCollection(STORAGE_KEYS.links, items.filter(item => item.id !== id));
    return true;
  },

  getByCategory: async (category) => {
    const all = await linksStorage.getAll();
    return all.filter(link => link.category === category);
  }
};

// Projects Management
export const projectsStorage = {
  getAll: async () => {
    const items = readCollection(STORAGE_KEYS.projects);
    return items
      .map(project => ({
        ...project,
        githubUrl: project.githubUrl ?? project.github_url ?? '',
        liveUrl: project.liveUrl ?? project.live_url ?? ''
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  add: async (project) => {
    const items = readCollection(STORAGE_KEYS.projects);
    const now = new Date().toISOString();
    const newItem = {
      id: generateId(),
      name: project.name,
      description: project.description || '',
      github_url: project.githubUrl || '',
      githubUrl: project.githubUrl || '',
      live_url: project.liveUrl || '',
      liveUrl: project.liveUrl || '',
      technologies: project.technologies || '',
      status: project.status || 'In Progress',
      workspace_id: project.workspace_id || null,
      created_at: now,
      updated_at: now
    };
    items.unshift(newItem);
    writeCollection(STORAGE_KEYS.projects, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = readCollection(STORAGE_KEYS.projects);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Project not found');

    const updated = {
      ...items[index],
      ...updates,
      github_url: updates.githubUrl !== undefined ? updates.githubUrl : items[index].github_url,
      live_url: updates.liveUrl !== undefined ? updates.liveUrl : items[index].live_url,
      updated_at: new Date().toISOString()
    };
    items[index] = updated;
    writeCollection(STORAGE_KEYS.projects, items);
    return updated;
  },

  delete: async (id) => {
    const items = readCollection(STORAGE_KEYS.projects);
    writeCollection(STORAGE_KEYS.projects, items.filter(item => item.id !== id));
    return true;
  }
};

// Blog Posts Management
export const blogStorage = {
  getAll: async () => {
    const items = readCollection(STORAGE_KEYS.blog);
    return items
      .map(post => ({
        ...post,
        createdAt: post.createdAt || post.created_at
      }))
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  },

  add: async (post) => {
    const items = readCollection(STORAGE_KEYS.blog);
    const now = new Date().toISOString();
    const newItem = {
      id: generateId(),
      ...post,
      created_at: now,
      createdAt: now,
      updated_at: now
    };
    items.unshift(newItem);
    writeCollection(STORAGE_KEYS.blog, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = readCollection(STORAGE_KEYS.blog);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Blog post not found');

    const updated = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    items[index] = updated;
    writeCollection(STORAGE_KEYS.blog, items);
    return updated;
  },

  delete: async (id) => {
    const items = readCollection(STORAGE_KEYS.blog);
    writeCollection(STORAGE_KEYS.blog, items.filter(item => item.id !== id));
    return true;
  },

  getByTag: async (tag) => {
    const all = await blogStorage.getAll();
    const lower = tag.toLowerCase();
    return all.filter(post => {
      if (Array.isArray(post.tags)) {
        return post.tags.some(t => String(t).toLowerCase().includes(lower));
      }
      return String(post.tags || '').toLowerCase().includes(lower);
    });
  }
};

// Prompts Management
export const promptsStorage = {
  getAll: async () => {
    const items = readCollection(STORAGE_KEYS.prompts);
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  add: async (prompt) => {
    const items = readCollection(STORAGE_KEYS.prompts);
    const now = new Date().toISOString();
    const newItem = {
      id: generateId(),
      ...prompt,
      created_at: now,
      updated_at: now
    };
    items.unshift(newItem);
    writeCollection(STORAGE_KEYS.prompts, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = readCollection(STORAGE_KEYS.prompts);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Prompt not found');

    const updated = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    items[index] = updated;
    writeCollection(STORAGE_KEYS.prompts, items);
    return updated;
  },

  delete: async (id) => {
    const items = readCollection(STORAGE_KEYS.prompts);
    writeCollection(STORAGE_KEYS.prompts, items.filter(item => item.id !== id));
    return true;
  },

  getByCategory: async (category) => {
    const all = await promptsStorage.getAll();
    return all.filter(prompt => prompt.category === category);
  }
};

// Videos Management
export const videosStorage = {
  getAll: async () => {
    const items = readCollection(STORAGE_KEYS.videos);
    return items
      .map(video => ({
        ...video,
        videoId: video.videoId || video.video_id
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  add: async (video) => {
    const items = readCollection(STORAGE_KEYS.videos);
    const now = new Date().toISOString();
    const newItem = {
      id: generateId(),
      title: video.title,
      url: video.url,
      video_id: video.videoId,
      videoId: video.videoId,
      description: video.description || '',
      notes: video.notes || '',
      workspace_id: video.workspace_id || null,
      created_at: now,
      updated_at: now
    };
    items.unshift(newItem);
    writeCollection(STORAGE_KEYS.videos, items);
    return newItem;
  },

  update: async (id, updates) => {
    const items = readCollection(STORAGE_KEYS.videos);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Video not found');

    const updated = {
      ...items[index],
      ...updates,
      video_id: updates.videoId !== undefined ? updates.videoId : items[index].video_id,
      updated_at: new Date().toISOString()
    };
    items[index] = updated;
    writeCollection(STORAGE_KEYS.videos, items);
    return updated;
  },

  delete: async (id) => {
    const items = readCollection(STORAGE_KEYS.videos);
    writeCollection(STORAGE_KEYS.videos, items.filter(item => item.id !== id));
    return true;
  }
};

// Theme Management
export const themeStorage = {
  get: () => localStorage.getItem('workspace_theme') || 'dark',
  set: (theme) => localStorage.setItem('workspace_theme', theme)
};

// Local Backup & Restore Utilities
export const exportAllLocalData = () => {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {}
  };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      backup.data[key] = localStorage.getItem(key);
    }
  }
  return backup;
};

export const importAllLocalData = (backup) => {
  if (!backup || !backup.data || typeof backup.data !== 'object') {
    throw new Error('Invalid backup file format');
  }
  Object.entries(backup.data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    }
  });
  return true;
};

// Export all for convenience
export const storage = {
  links: linksStorage,
  projects: projectsStorage,
  blog: blogStorage,
  prompts: promptsStorage,
  videos: videosStorage,
  theme: themeStorage
};
