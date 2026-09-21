import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageLightbox({ images, currentIndex, onClose, onPrevious, onNext }) {
  if (!images?.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition-colors"
        aria-label="Close image preview"
      >
        <X className="w-6 h-6" />
      </button>
      {images.length > 1 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <div className="max-w-5xl max-h-[85vh] p-4 flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt="Expanded attachment"
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
      </div>
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-neutral-900/80 text-white text-xs font-semibold">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
