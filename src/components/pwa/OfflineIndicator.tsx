
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) return null;

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2">
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-green-700">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-500" />
            <span className="text-orange-700">You're offline - some features may be limited</span>
          </>
        )}
      </div>
    </Card>
  );
}
