
## Add Ordinal Day & Uppercase Month Options for Short Date

This plan adds two new toggle options for the short date format to allow ordinal day suffixes (7th, 1st, 2nd, etc.) and uppercase months (FEB instead of Feb).

### Summary of Changes

| Change | Description |
|--------|-------------|
| New Config Options | Add `dateOrdinal` and `dateUppercase` boolean fields to `TextFieldConfig` |
| UI Toggles | Show checkboxes when short date format is selected |
| Date Formatting | Update `formatDate` function to apply ordinal suffix and uppercase transformations |

### Preview Examples

| Options | Output |
|---------|--------|
| Default short | `7 Feb` |
| + Ordinal | `7th Feb` |
| + Uppercase | `7 FEB` |
| + Both | `7th FEB` |

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/imageGenerator.ts` | Add `dateOrdinal` and `dateUppercase` to `TextFieldConfig` interface and defaults |
| `src/components/TemplateEditor.tsx` | Add checkbox toggles for ordinal and uppercase options (shown when date format is "short") |
| `src/hooks/useImageGenerator.ts` | Update `formatDate` function to apply ordinal suffix and uppercase month |

### Implementation Steps

#### 1. Update `src/types/imageGenerator.ts`

Add two new optional boolean fields to `TextFieldConfig`:

```typescript
export interface TextFieldConfig {
  showEventName: boolean;
  showDate: boolean;
  showLocation: boolean;
  showVenue: boolean;
  dateFormat: 'short' | 'long' | 'full';
  dateOrdinal?: boolean;    // Add ordinal suffix: 7th, 1st, 2nd, 3rd
  dateUppercase?: boolean;  // Uppercase month: FEB instead of Feb
  locationFormat: 'city' | 'city-state' | 'city-country';
}
```

Update the default values:

```typescript
export const DEFAULT_TEXT_FIELDS: TextFieldConfig = {
  showEventName: true,
  showDate: false,
  showLocation: false,
  showVenue: false,
  dateFormat: 'long',
  dateOrdinal: false,
  dateUppercase: false,
  locationFormat: 'city-state',
};
```

#### 2. Update `src/components/TemplateEditor.tsx`

Add checkbox toggles below the date format dropdown, only visible when "short" format is selected:

```tsx
{textFields.showDate && textFields.dateFormat === 'short' && (
  <div className="flex flex-wrap gap-4 pt-2">
    <div className="flex items-center gap-2">
      <Checkbox
        id="dateOrdinal"
        checked={textFields.dateOrdinal ?? false}
        onCheckedChange={(checked) => handleFieldToggle('dateOrdinal', checked)}
      />
      <Label htmlFor="dateOrdinal" className="text-sm">Ordinal (7th)</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox
        id="dateUppercase"
        checked={textFields.dateUppercase ?? false}
        onCheckedChange={(checked) => handleFieldToggle('dateUppercase', checked)}
      />
      <Label htmlFor="dateUppercase" className="text-sm">Uppercase (FEB)</Label>
    </div>
  </div>
)}
```

#### 3. Update `src/hooks/useImageGenerator.ts`

Modify the `formatDate` function to handle ordinal suffixes and uppercase:

```typescript
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatDate = useCallback((dateStr: string, fields: TextFieldConfig): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    switch (fields.dateFormat) {
      case 'short': {
        const day = date.getDate();
        let month = format(date, 'MMM'); // e.g., "Feb"
        
        // Apply uppercase if enabled
        if (fields.dateUppercase) {
          month = month.toUpperCase(); // "FEB"
        }
        
        // Apply ordinal suffix if enabled
        if (fields.dateOrdinal) {
          return `${day}${getOrdinalSuffix(day)} ${month}`; // "7th FEB"
        }
        
        return `${day} ${month}`; // "7 Feb"
      }
      case 'full':
        return format(date, 'EEEE, d MMMM yyyy');
      case 'long':
      default:
        return format(date, 'd MMMM yyyy');
    }
  } catch {
    return dateStr;
  }
}, []);
```

Update the function signature in `buildTextLines` to pass the full `fields` object:

```typescript
if (fields.showDate && event.STARTS_AT) {
  lines.push(formatDate(event.STARTS_AT, fields)); // Pass full fields object
}
```

### Ordinal Suffix Logic

The ordinal suffix follows English grammar rules:

| Day | Suffix | Result |
|-----|--------|--------|
| 1, 21, 31 | st | 1st, 21st, 31st |
| 2, 22 | nd | 2nd, 22nd |
| 3, 23 | rd | 3rd, 23rd |
| 4-20, 24-30 | th | 4th, 11th, 12th, 13th, 24th |

Note: 11th, 12th, 13th are special cases (not 11st, 12nd, 13rd) - handled by the `day > 3 && day < 21` check.
