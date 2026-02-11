import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const WHATS_NEW_VERSION = 'v2';
const STORAGE_KEY = `app.whatsNewSeen.${WHATS_NEW_VERSION}`;

export function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const forceShow = new URLSearchParams(window.location.search).get('forceWhatsNew') === '1';
    if (forceShow) {
      setOpen(true);
      return;
    }
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      setOpen(seen !== 'true');
    } catch {
      setOpen(true);
    }
  }, []);

  const handleGotIt = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleGotIt()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border/80 shadow-xl shadow-black/5">
        <div className="p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              Smarter Color Picking is Here
            </DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc list-inside">
            <li>Smarter object detection</li>
            <li>Spot / Dominant / Auto modes</li>
            <li>More transparent results</li>
          </ul>
          <Button className="w-full" onClick={handleGotIt}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
