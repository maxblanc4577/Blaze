import React, { useState } from 'react';
import { X, Smartphone, Download, Apple, QrCode, Share, PlusSquare, CheckCircle2, Globe, Shield } from 'lucide-react';

interface DownloadAppModalProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'qr'>('ios');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const handleSimulateInstall = (platform: string) => {
    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      setInstalled(true);
      showToast(`🎉 Blaze app successfully downloaded for ${platform}! Check your device home screen.`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1C1C1E] text-white border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#252528]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC107] flex items-center justify-center text-[#121212] font-black text-2xl shadow-lg">
              B
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Download Blaze Mobile App
                <span className="text-[10px] bg-[#FFC107]/20 text-[#FFC107] px-2 py-0.5 rounded-full font-bold">
                  v2.4.0
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Install native iOS & Android apps for instant alerts & GPS radar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#18181A] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'ios'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Apple className="w-4 h-4 text-[#FFC107]" />
            <span>Apple iOS (iPhone / iPad)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'android'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android (APK / Play Store)</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-4 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'qr'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {installed ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">App Successfully Installed!</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                Blaze is now available on your device home screen with offline caching, push notifications, and high-speed proximity radar.
              </p>
              <button
                onClick={() => setInstalled(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition"
              >
                View Instructions Again
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'ios' && (
                <div className="space-y-4">
                  <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">App Store Official Release</h4>
                      <p className="text-xs text-neutral-400">Optimized for iOS 16.0+</p>
                    </div>
                    <button
                      onClick={() => handleSimulateInstall('iOS (App Store)')}
                      disabled={isInstalling}
                      className="bg-[#FFC107] hover:bg-amber-400 text-[#121212] font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow"
                    >
                      {isInstalling ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isInstalling ? 'Downloading...' : 'Get from App Store'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Manual PWA Installation (Safari)</h4>
                    <div className="space-y-2.5 text-xs text-neutral-300">
                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-[#FFC107]/20 text-[#FFC107] font-bold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-semibold text-white">Tap the Share button in Safari</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                            Look for the Share icon <Share className="w-3.5 h-3.5 text-cyan-400 inline" /> at the bottom menu bar.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-[#FFC107]/20 text-[#FFC107] font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-semibold text-white">Select "Add to Home Screen"</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                            Scroll down the action sheet and tap <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> Add to Home Screen.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-[#FFC107]/20 text-[#FFC107] font-bold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-semibold text-white">Launch Blaze Instantly</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            Open Blaze directly from your iPhone home screen with full screen immersive experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-4">
                  <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Play Store & APK</h4>
                      <p className="text-xs text-neutral-400">Optimized for Android 10.0+</p>
                    </div>
                    <button
                      onClick={() => handleSimulateInstall('Android (Play Store)')}
                      disabled={isInstalling}
                      className="bg-emerald-500 hover:bg-emerald-400 text-[#121212] font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow"
                    >
                      {isInstalling ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isInstalling ? 'Downloading...' : 'Install APK / Play'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quick Android Installation Guide</h4>
                    <div className="space-y-2.5 text-xs text-neutral-300">
                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-semibold text-white">Open in Chrome Browser</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            Navigate to Blaze in Chrome on your Android smartphone or tablet.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-semibold text-white">Tap Menu & "Install App"</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            Tap the 3-dot menu in top right and select "Install app" or "Add to Home screen".
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-semibold text-white">Enjoy Native Features</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            Get instant push notifications, location radar, and lightning-fast performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'qr' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-lg flex items-center justify-center border-4 border-[#FFC107]">
                    {/* Simulated QR Code using CSS / Grid */}
                    <div className="w-full h-full bg-neutral-900 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                      <QrCode className="w-20 h-20 text-[#FFC107] mb-2" />
                      <p className="text-[10px] text-neutral-300 font-mono">BLAZE-MOBILE-APP-INSTALL</p>
                      <p className="text-[9px] text-emerald-400 font-bold mt-1">SCAN WITH PHONE CAMERA</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Point your iPhone or Android camera at the QR code above to instantly open and install the Blaze app on your mobile device.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-[#252528] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Secure & Malware-Free</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
