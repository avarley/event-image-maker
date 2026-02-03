

# Shared Community Templates Feature

This plan adds the ability to save local templates to a shared community library that everyone can access and use.

---

## Overview

Currently, templates are stored only in your browser's localStorage - visible only to you. This feature will:

1. Add a **"Publish to Community"** button that shares your template with everyone
2. Create a **"Community Templates"** tab where you can browse templates others have shared
3. Allow users to **import** community templates into their local workspace

---

## What You'll See

### New UI Elements

- **Publish button** on each template in your list (cloud upload icon)
- **Community Templates tab** in the Templates section showing shared templates
- **Import button** on community templates to copy them locally
- **Author name prompt** when publishing (optional - can be anonymous)

### User Flow

1. Create and customize your template locally (as normal)
2. Click the "Publish" icon on the template
3. Enter an optional author name
4. Template appears in Community Templates for everyone

---

## Technical Requirements

### Backend Setup (Supabase)

This feature requires connecting to Supabase for:

| Component | Purpose |
|-----------|---------|
| **Database table** | Store template metadata (name, author, settings) |
| **Storage bucket** | Store baseplate images and overlays |
| **Row-Level Security** | Allow anyone to read, but track uploads |

### Database Schema

```text
shared_templates table:
- id (UUID, primary key)
- name (text)
- author_name (text, optional)
- text_config (JSONB - all text settings)
- text_enabled (boolean)
- overlay_metadata (JSONB - overlay positions/settings)
- baseplate_url (text - storage URL)
- overlay_urls (text array - storage URLs)
- downloads_count (integer)
- created_at (timestamp)
```

### Storage Structure

```text
shared-templates/
├── {template_id}/
│   ├── baseplate.png
│   ├── overlay-1.png
│   ├── overlay-2.png
│   └── ...
```

---

## Implementation Steps

### Step 1: Enable Supabase Cloud

Set up Lovable Cloud with database and storage capabilities.

### Step 2: Create Database Migration

Create the `shared_templates` table with appropriate columns and RLS policies allowing public read access.

### Step 3: Create Storage Bucket

Create a public `shared-templates` bucket with policies for:
- Public read access (anyone can view templates)
- Authenticated or anonymous upload (for publishing)

### Step 4: Create Shared Templates Hook

New file: `src/hooks/useSharedTemplates.ts`
- `fetchSharedTemplates()` - Load community templates
- `publishTemplate(template, authorName)` - Upload to community
- `importTemplate(sharedTemplate)` - Copy to local storage
- `deleteSharedTemplate(id)` - Remove if author

### Step 5: Create Community Templates UI

New component: `src/components/CommunityTemplates.tsx`
- Grid view of shared templates with thumbnails
- Search/filter capabilities
- Import button on each template
- Download counter display

### Step 6: Add Publish Button to TemplateList

Modify `src/components/TemplateList.tsx`:
- Add cloud upload icon button
- Show publish dialog for author name
- Handle upload progress/success

### Step 7: Update Index Page

Add tabbed navigation between:
- "My Templates" (current local storage)
- "Community Templates" (shared library)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSharedTemplates.ts` | Supabase operations for shared templates |
| `src/components/CommunityTemplates.tsx` | Browse shared templates UI |
| `src/components/PublishTemplateDialog.tsx` | Author name input dialog |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/TemplateList.tsx` | Add publish button |
| `src/pages/Index.tsx` | Add community templates section |

## Database Migrations

| Migration | Purpose |
|-----------|---------|
| Create `shared_templates` table | Store template metadata |
| Create storage bucket and policies | Store template images |

---

## Size Considerations

- Images will be compressed before upload (using existing compression utilities)
- Large templates may take a few seconds to upload
- Storage costs scale with usage (Supabase free tier includes generous limits)

---

## Security Notes

- Templates are public (anyone can view/import)
- No authentication required to browse
- Publishing tracks browser fingerprint to prevent abuse
- Rate limiting on uploads to prevent spam

---

## Alternative: Export/Import Files

If you prefer not to set up Supabase, an alternative approach is:

1. Add "Export as JSON" button that downloads template as a `.json` file
2. Add "Import from File" button to load templates from JSON files
3. Share files manually (email, Slack, etc.)

This requires no backend but means templates aren't centrally browsable.

---

## Next Steps

To proceed, I will need to:

1. **Enable Lovable Cloud** - This will set up Supabase automatically
2. **Create the database table and storage bucket**
3. **Build the UI components and hooks**

Would you like me to proceed with the full Supabase implementation, or would you prefer the simpler file-based export/import approach?

