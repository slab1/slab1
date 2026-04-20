
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Smartphone, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user has been on the site for a bit
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Installing app...');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !deferredPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm z-50 shadow-lg border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Install Reservatoo</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Get the full app experience with offline access and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 h-8 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Install
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 h-8 text-xs"
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
