import { useState, useEffect, useCallback } from 'react';
import { SavedTemplate, TextConfig, DEFAULT_TEXT_FIELDS } from '@/types/imageGenerator';
import { toast } from 'sonner';

const STORAGE_KEY = 'bulk-image-generator-templates';

const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontFamily: 'Roboto',
  fontSize: 56,
  color: '#ffffff',
  x: 540,
  y: 940,
  maxWidth: 550,
  textAlign: 'center',
  fields: DEFAULT_TEXT_FIELDS,
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
        // Migrate old templates that don't have fields property
        const migrated = parsed.map((t) => ({
          ...t,
          textConfig: {
            ...t.textConfig,
            fields: t.textConfig.fields || DEFAULT_TEXT_FIELDS,
          },
        }));
        setTemplates(migrated);
        if (migrated.length > 0 && !activeTemplateId) {
          setActiveTemplateId(migrated[0].id);
        }
      } catch (e) {
        console.error('Failed to parse stored templates:', e);
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        toast.error('Storage full! Delete some templates or overlays to free up space.', {
          duration: 5000,
        });
      } else {
        console.error('Failed to save templates:', e);
      }
    }
  }, [templates]);

  const createTemplate = useCallback((name: string = 'New Template'): SavedTemplate => {
    const newTemplate: SavedTemplate = {
      id: crypto.randomUUID(),
      name,
      baseplateDataUrl: '',
      textConfig: DEFAULT_TEXT_CONFIG,
      textEnabled: true,
      overlays: [],
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

  const addTemplate = useCallback((template: SavedTemplate) => {
    setTemplates((prev) => [...prev, template]);
    setActiveTemplateId(template.id);
  }, []);

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
    addTemplate,
  };
};
