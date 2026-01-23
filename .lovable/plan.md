

## Fix: Add Reset Button to the Correct Component

### Problem
The Reset button was added to `TextConfigPanel.tsx`, but the template editor uses its own inline text settings panel in `TemplateEditor.tsx`. That's why you're not seeing the Reset button.

### Solution
Add the Reset button to `TemplateEditor.tsx` where the "Text Settings" panel is actually rendered.

### Changes Required

**File: `src/components/TemplateEditor.tsx`**

1. **Import additional components**:
   - Add `Button` import (already present)
   - Add `RotateCcw` icon from lucide-react

2. **Add default text configuration constant**:
   ```typescript
   const DEFAULT_TEXT_CONFIG: TextConfig = {
     fontFamily: 'Roboto',
     fontSize: 56,
     color: '#ffffff',
     x: 540,
     y: 940,
     maxWidth: 550,
     textAlign: 'center',
   };
   ```

3. **Add reset handler function**:
   ```typescript
   const handleResetToDefaults = useCallback(() => {
     if (!template) return;
     onUpdateTemplate(template.id, { textConfig: DEFAULT_TEXT_CONFIG });
   }, [template, onUpdateTemplate]);
   ```

4. **Update the Text Settings header** (around line 139):
   - Change from just a span to a flex container with the Reset button
   - Add the Reset button with the RotateCcw icon

### Result
The Reset button will appear in the "Text Settings" header, allowing you to quickly reset all text configuration values to the defaults (Roboto font, 56px size, 550px max width, centered at x:540, y:940).

