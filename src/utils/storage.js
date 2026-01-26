// Supabase-based storage for managing all workspace data
import { supabase } from './supabaseClient';

// Helper to get current user ID
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// Links Management
export const linksStorage = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase for JavaScript
      return (data || []).map(link => ({
        ...link,
        name: link.title  // Map title to name for UI
      }));
    } catch (error) {
      console.error('Error fetching links:', error);
      return [];
    }
  },

  add: async (link) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('links')
        .insert([{
          title: link.name,
          url: link.url,
          category: link.category,
          description: link.description,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding link:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const updateData = { ...updates };
      if (updates.name) {
        updateData.title = updates.name;
        delete updateData.name;
      }

      const { data, error } = await supabase
        .from('links')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  getByCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching links by category:', error);
      return [];
    }
  }
};

// Projects Management
export const projectsStorage = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase for JavaScript
      return (data || []).map(project => ({
        ...project,
        githubUrl: project.github_url,
        liveUrl: project.live_url
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  add: async (project) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: project.name,
          description: project.description,
          github_url: project.githubUrl,
          live_url: project.liveUrl,
          technologies: project.technologies,
          status: project.status,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const updateData = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.githubUrl) updateData.github_url = updates.githubUrl;
      if (updates.liveUrl) updateData.live_url = updates.liveUrl;
      if (updates.technologies) updateData.technologies = updates.technologies;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

// Blog Posts Management
export const blogStorage = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase for JavaScript
      return (data || []).map(post => ({
        ...post,
        createdAt: post.created_at
      }));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  add: async (post) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ ...post, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding blog post:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  },

  getByTag: async (tag) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .ilike('tags', `%${tag}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching blog posts by tag:', error);
      return [];
    }
  }
};

// Prompts Management
export const promptsStorage = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
  },

  add: async (prompt) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prompts')
        .insert([{ ...prompt, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding prompt:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  },

  getByCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching prompts by category:', error);
      return [];
    }
  }
};

// Videos Management
export const videosStorage = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase for JavaScript
      return (data || []).map(video => ({
        ...video,
        videoId: video.video_id
      }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  add: async (video) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('videos')
        .insert([{
          title: video.title,
          url: video.url,
          video_id: video.videoId,
          description: video.description,
          notes: video.notes,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const updateData = { ...updates };
      if (updates.videoId) {
        updateData.video_id = updates.videoId;
        delete updateData.videoId;
      }

      const { data, error } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};


// Theme Management (still using localStorage for theme preference)
export const themeStorage = {
  get: () => localStorage.getItem('workspace_theme') || 'dark',
  set: (theme) => localStorage.setItem('workspace_theme', theme)
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
