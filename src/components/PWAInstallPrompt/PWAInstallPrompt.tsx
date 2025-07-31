import React, { useEffect, useState } from 'react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
        console.log('beforeinstallprompt fired!');
      e.preventDefault();

      // Only allow if prompt isn't already set
      if (!deferredPrompt) {
        setDeferredPrompt(e);
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [deferredPrompt]);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      // User accepted or dismissed — hide prompt forever
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      zIndex: 1000,
    }}>
      <span>Install our app?</span>
      <button
        onClick={handleInstallClick}
        style={{
          marginLeft: 10,
          background: '#4caf50',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Install
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
