"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare, Download } from "lucide-react";
import Image from "next/image";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if already dismissed in this browser
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const now = Date.now();
      // Only show again if it's been more than 1 days
      if (now - dismissedAt < 1 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // 3. Detect standalone mode (installed PWA)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // 4. Android/Chrome 'beforeinstallprompt' event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed && !standalone) {
        // Show after 3s delay to be less intrusive
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. For iOS, show after 3s delay if not standalone/dismissed
    // iOS doesn't have the beforeinstallprompt event
    if (iOS && !isDismissed && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isDismissed, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("install-prompt-dismissed", Date.now().toString());
  };

  // Don't render anything if already installed or dismissed
  if (isStandalone || isDismissed) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md pointer-events-none"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/90 dark:border-zinc-800 pointer-events-auto">
            {/* Background Glow */}
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-opacity pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              {/* App Icon Mockup */}
              <div className="flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
                  <Image
                    src="logo.svg"
                    alt="TandemSync Logo"
                    width={40}
                    height={40}
                    className="h-9 w-9 brightness-0 invert object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pr-6 text-left">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Install TandemSync
                </h3>
                <p className="mt-1 text-sm font-medium leading-snug text-zinc-600 dark:text-zinc-400">
                  Add to home screen for faster access & real-time trip sync.
                </p>

                {/* Instructions / Actions */}
                <div className="mt-4">
                  {!isIOS ? (
                    <button
                      onClick={handleInstallClick}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98]"
                    >
                      <Download size={16} />
                      Install Now
                    </button>
                  ) : (
                    <div className="space-y-2.5 rounded-xl bg-blue-50/50 p-3 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <p className="flex items-center gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">1</span>
                        Tap <Share size={16} className="inline text-blue-600" /> in browser bar
                      </p>
                      <p className="flex items-center gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">2</span>
                        Select <PlusSquare size={16} className="inline text-blue-600" /> {'"Add to Home Screen"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

