import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'saved_pyqs';

export function useBookmarks() {
  const [savedPapers, setSavedPapers] = useState([]);

  const loadSavedPapers = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedPapers(Array.isArray(parsed) ? parsed : []);
      } else {
        setSavedPapers([]);
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
      setSavedPapers([]);
    }
  }, []);

  useEffect(() => {
    loadSavedPapers();

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY || !e.key) {
        loadSavedPapers();
      }
    };
    
    // Listen for cross-tab storage events and our custom intra-tab event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkUpdated', loadSavedPapers);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkUpdated', loadSavedPapers);
    };
  }, [loadSavedPapers]);

  const toggleSave = useCallback((paper) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        list = Array.isArray(parsed) ? parsed : [];
      }

      if (list.some((p) => p?.id === paper.id)) {
        list = list.filter((p) => p?.id !== paper.id);
      } else {
        list.push(paper);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('bookmarkUpdated'));
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  }, []);

  const removeBookmark = useCallback((id) => {
    try {
      const updated = savedPapers.filter((p) => p.id !== id);
      setSavedPapers(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('bookmarkUpdated'));
    } catch (e) {
      console.error('Failed to remove bookmark:', e);
    }
  }, [savedPapers]);

  const clearAll = useCallback(() => {
    try {
      setSavedPapers([]);
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('bookmarkUpdated'));
    } catch (e) {
      console.error('Failed to clear bookmarks:', e);
    }
  }, []);

  const isSaved = useCallback((id) => {
    return savedPapers.some((p) => p?.id === id);
  }, [savedPapers]);

  return {
    savedPapers,
    toggleSave,
    removeBookmark,
    clearAll,
    isSaved,
  };
}
