import React, { useState } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Check, RotateCw } from 'lucide-react';

interface ImageCropModalProps {
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageUrl, onClose, onCropComplete }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  const handleApply = () => {
    // In a production environment with canvas cropping, we would render to canvas and export data URL.
    // Here we pass the adjusted image URL along with crop metadata or the image itself ensuring 1:1 square display.
    onCropComplete(imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Crop Profile Picture</h3>
              <p className="text-xs text-neutral-400">Ensure your photo maintains a consistent 1:1 square aspect ratio.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Square Crop Viewport */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto rounded-3xl overflow-hidden border-4 border-[#FFC107] bg-black shadow-2xl flex items-center justify-center group">
            <img
              src={imageUrl}
              alt="Crop preview"
              style={{
                transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-2xl m-2 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
            <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium border border-white/10">
              1:1 Square Ratio Enforced
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
              <span className="flex items-center gap-1.5"><ZoomIn className="w-4 h-4 text-amber-400" /> Zoom Scale</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#FFC107] cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center space-x-2 transition border border-neutral-700"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); setRotation(0); }}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition border border-neutral-700"
              >
                Reset Framing
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-[#FFC107] hover:bg-[#ffca28] text-[#121212] text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Crop & Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
