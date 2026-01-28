

## Add PDF Download for Documentation

This plan adds a "Download as PDF" button to the documentation page, allowing you to save the complete technical documentation as a PDF file.

### Approach

Use the **html2pdf.js** library, which combines html2canvas and jsPDF to convert HTML content to PDF. This approach:

- Works entirely client-side (no server needed)
- Preserves the visual styling of the documentation
- Handles multi-page content automatically
- Is lightweight and well-maintained

### Summary of Changes

| File | Change |
|------|--------|
| `package.json` | Add `html2pdf.js` dependency |
| `src/pages/Documentation.tsx` | Add download button and PDF generation logic |

---

## Technical Details

### 1. Install html2pdf.js

Add the dependency:

```bash
npm install html2pdf.js
```

### 2. Update Documentation.tsx

Add a ref to the content container and a download button in the header:

```typescript
import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';

const Documentation = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsGenerating(true);
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: 'bulk-image-generator-documentation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(options).from(contentRef.current).save();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Bulk Image Generator</h1>
          <p className="text-xl text-muted-foreground">
            Technical Documentation & Architecture Guide
          </p>
        </div>
      </div>

      {/* Wrap content in ref for PDF generation */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ... existing content ... */}
      </div>
    </div>
  );
};
```

### 3. Add TypeScript Declaration (if needed)

If TypeScript complains about the module, add a declaration file:

```typescript
// src/html2pdf.d.ts
declare module 'html2pdf.js';
```

### PDF Output Details

| Setting | Value | Reason |
|---------|-------|--------|
| Format | A4 Portrait | Standard document format |
| Scale | 2x | Higher quality text and graphics |
| Margins | 10mm all sides | Clean readable output |
| Quality | 98% JPEG | Good balance of quality and file size |
| Filename | `bulk-image-generator-documentation.pdf` | Descriptive name |

### User Experience

1. User clicks "Download PDF" button in header
2. Button shows "Generating..." while processing
3. PDF is automatically downloaded to their device
4. Button returns to normal state

The PDF will include all sections: Core Concept, Technical Architecture, Key Design Decisions, Configuration Reference, and Future Enhancements.

