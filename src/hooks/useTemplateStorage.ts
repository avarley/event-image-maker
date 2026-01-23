import { useState, useEffect, useCallback } from 'react';
import { SavedTemplate, TextConfig } from '@/types/imageGenerator';

const STORAGE_KEY = 'bulk-image-generator-templates';

const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontFamily: 'Arial',
  fontSize: 56,
  color: '#ffffff',
  x: 400,
  y: 50,
  maxWidth: 500,
  textAlign: 'center',
};

export const useTemplateStorage = () => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedTemplate[];
        setTemplates(parsed);
        if (parsed.length > 0 && !activeTemplateId) {
          setActiveTemplateId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse stored templates:', e);
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const createTemplate = useCallback((name: string = 'New Template'): SavedTemplate => {
    const newTemplate: SavedTemplate = {
      id: crypto.randomUUID(),
      name,
      baseplateDataUrl: '',
      textConfig: DEFAULT_TEXT_CONFIG,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setActiveTemplateId(newTemplate.id);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<SavedTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: Date.now() }
          : t
      )
    );
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (activeTemplateId === id && filtered.length > 0) {
        setActiveTemplateId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveTemplateId(null);
      }
      return filtered;
    });
  }, [activeTemplateId]);

  const duplicateTemplate = useCallback((id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    const duplicate: SavedTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [...prev, duplicate]);
    setActiveTemplateId(duplicate.id);
  }, [templates]);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || null;

  return {
    templates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
};
