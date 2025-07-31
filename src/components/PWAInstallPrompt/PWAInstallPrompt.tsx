import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) setPlatform('android');
    else if (userAgent.includes('windows')) setPlatform('windows');
    else setPlatform('other');

    const handleBeforeInstallPrompt = (e: any) => {
        console.log('beforeinstallprompt fired!');
      e.preventDefault();

      // Only allow if prompt isn't already set
      if (!deferredPrompt) {
        setDeferredPrompt(e);
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt',handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [deferredPrompt]);

const handleInstallClick = () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');

      // Push event to dataLayer for GTM
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: 'pwa_install_success' });
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  });
};


  if (!showPrompt) return null;

return (
  <div
    className={
      platform === 'android'
        ? "bg-[#71f8f880] backdrop-blur-md border border-white/30 fixed bottom-0 left-0 w-full text-[#182b45] px-3 py-2 flex justify-center items-center z-50 rounded-t-lg"
        : "fixed bottom-5 right-5 z-50"
    }
  >
    {platform === 'android' ? (
      <>
        <X
          className="mr-2"
          onClick={() => {
            setShowPrompt(false);
            setDeferredPrompt(null);
          }}
        />

        <img
          src="128.png"
          alt="logo"
          style={{
            width: '60px',
            height: '60px',
            padding: '6px',
            backgroundColor: 'white',
          }}
          className="rounded-full"
        />

        <div className="flex flex-col items-start text-start ml-4">
          <span className="font-bold">Get the worko app</span>
          <span className="text-sm">Faster job search & better experience</span>
        </div>

        <button
          onClick={handleInstallClick}
          className="ml-4 mt-2 bg-[#007bff] hover:bg-green-700 text-white rounded-full px-5 py-2 cursor-pointer border-none"
        >
          Install
        </button>
      </>
    ) : null}
  </div>
);
};

export default PWAInstallPrompt;
