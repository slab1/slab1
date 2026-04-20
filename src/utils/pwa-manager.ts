
// PWA and offline capabilities manager
export class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  async activateUpdate(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Install prompt handling
  async promptInstall(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      return result.outcome === 'accepted';
    }
    return false;
  }

  isInstallable(): boolean {
    return !!(window as any).deferredPrompt;
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnlineStatusChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Background sync for reservations
  async scheduleBackgroundSync(tag: string, data: any): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Store data in IndexedDB for sync
      await this.storeForSync(tag, data);
      
      // Check if sync is supported and register
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
      } else {
        console.warn('Background sync not supported');
        // Fallback: try to sync immediately
        await this.attemptImmediateSync(tag, data);
      }
    }
  }

  private async attemptImmediateSync(tag: string, data: any): Promise<void> {
    try {
      // Attempt immediate sync as fallback
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Remove from pending sync
        localStorage.removeItem(`sync_${tag}`);
      }
    } catch (error) {
      console.error('Immediate sync failed:', error);
    }
  }

  private async storeForSync(tag: string, data: any): Promise<void> {
    // Simple localStorage fallback for demo
    localStorage.setItem(`sync_${tag}`, JSON.stringify(data));
  }

  // Push notifications
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (this.registration) {
      try {
        const subscription = await (this.registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'your-vapid-public-key' // Replace with actual VAPID key
          ) as BufferSource,
        });
        return subscription;
      } catch (error) {
        console.error('Push subscription failed:', error);
        return null;
      }
    }
    return null;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pwaManager = new PWAManager();

// Initialize PWA manager
if (typeof window !== 'undefined') {
  pwaManager.init();
}
