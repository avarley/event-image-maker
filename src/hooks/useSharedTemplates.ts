import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SharedTemplate, SharedTemplateInsert } from '@/types/sharedTemplates';
import { SavedTemplate, SavedOverlay, TextConfig } from '@/types/imageGenerator';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';

const BUCKET_NAME = 'shared-templates';

export const useSharedTemplates = () => {
  const [sharedTemplates, setSharedTemplates] = useState<SharedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchSharedTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure matches
      setSharedTemplates((data || []) as unknown as SharedTemplate[]);
    } catch (error) {
      console.error('Failed to fetch shared templates:', error);
      toast.error('Failed to load community templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadImage = async (
    templateId: string,
    dataUrl: string,
    filename: string
  ): Promise<string | null> => {
    try {
      // Compress the image first
      const compressedDataUrl = await compressImage(dataUrl, { maxWidth: 1920, quality: 0.85 });
      
      // Convert data URL to blob
      const response = await fetch(compressedDataUrl);
      const blob = await response.blob();

      const path = `${templateId}/${filename}`;
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, blob, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

  const publishTemplate = useCallback(
    async (template: SavedTemplate, authorName?: string): Promise<boolean> => {
      if (!template.baseplateDataUrl) {
        toast.error('Template must have a baseplate image');
        return false;
      }

      setIsPublishing(true);
      try {
        const templateId = crypto.randomUUID();

        // Upload baseplate
        const baseplateUrl = await uploadImage(
          templateId,
          template.baseplateDataUrl,
          'baseplate.png'
        );

        if (!baseplateUrl) {
          throw new Error('Failed to upload baseplate image');
        }

        // Upload overlays
        const overlayUrls: string[] = [];
        const overlayMetadata: SavedOverlay[] = [];

        for (let i = 0; i < (template.overlays || []).length; i++) {
          const overlay = template.overlays[i];
          const overlayUrl = await uploadImage(
            templateId,
            overlay.dataUrl,
            `overlay-${i}.png`
          );

          if (overlayUrl) {
            overlayUrls.push(overlayUrl);
            overlayMetadata.push({
              ...overlay,
              dataUrl: overlayUrl, // Replace local dataUrl with remote URL
            });
          }
        }

        // Insert into database
        const insertData: SharedTemplateInsert = {
          name: template.name,
          author_name: authorName || null,
          text_config: template.textConfig,
          text_enabled: template.textEnabled ?? true,
          overlay_metadata: overlayMetadata.length > 0 ? overlayMetadata : null,
          baseplate_url: baseplateUrl,
          overlay_urls: overlayUrls.length > 0 ? overlayUrls : null,
        };

        const { error } = await supabase
          .from('shared_templates')
          .insert(insertData as any);

        if (error) throw error;

        toast.success('Template published to community!');
        await fetchSharedTemplates();
        return true;
      } catch (error) {
        console.error('Failed to publish template:', error);
        toast.error('Failed to publish template');
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [fetchSharedTemplates]
  );

  const importTemplate = useCallback(
    async (sharedTemplate: SharedTemplate): Promise<SavedTemplate | null> => {
      try {
        // Increment download count
        await supabase
          .from('shared_templates')
          .update({ downloads_count: (sharedTemplate.downloads_count || 0) + 1 })
          .eq('id', sharedTemplate.id);

        // Convert overlay URLs back to data URLs
        const overlays: SavedOverlay[] = [];
        if (sharedTemplate.overlay_metadata) {
          for (const overlay of sharedTemplate.overlay_metadata) {
            // The overlay.dataUrl is now a public URL, we'll use it directly
            overlays.push({
              ...overlay,
              id: crypto.randomUUID(), // Generate new ID for local use
            });
          }
        }

        // Create local template
        const localTemplate: SavedTemplate = {
          id: crypto.randomUUID(),
          name: `${sharedTemplate.name} (Imported)`,
          baseplateDataUrl: sharedTemplate.baseplate_url || '',
          textConfig: sharedTemplate.text_config as TextConfig,
          textEnabled: sharedTemplate.text_enabled,
          overlays,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        toast.success('Template imported to your workspace!');
        return localTemplate;
      } catch (error) {
        console.error('Failed to import template:', error);
        toast.error('Failed to import template');
        return null;
      }
    },
    []
  );

  return {
    sharedTemplates,
    isLoading,
    isPublishing,
    fetchSharedTemplates,
    publishTemplate,
    importTemplate,
  };
};
