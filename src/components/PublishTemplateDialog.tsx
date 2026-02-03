import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';

interface PublishTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  isPublishing: boolean;
  onPublish: (authorName?: string) => void;
}

export const PublishTemplateDialog = ({
  open,
  onOpenChange,
  templateName,
  isPublishing,
  onPublish,
}: PublishTemplateDialogProps) => {
  const [authorName, setAuthorName] = useState('');

  const handlePublish = () => {
    onPublish(authorName.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish to Community</DialogTitle>
          <DialogDescription>
            Share "{templateName}" with the community. Others will be able to import and use
            your template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="author-name">Your Name (optional)</Label>
            <Input
              id="author-name"
              placeholder="Anonymous"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={isPublishing}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to publish anonymously
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
