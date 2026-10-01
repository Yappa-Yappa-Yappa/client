import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ImageLightbox({ images, currentIndex, onClose, onPrevious, onNext }) {
  useEffect(() => {
    if (!images?.length) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && images.length > 1) onPrevious();
      if (event.key === "ArrowRight" && images.length > 1) onNext();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images, onClose, onNext, onPrevious]);

  if (!images?.length) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
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
      <div className="flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center">
        <img
          src={images[currentIndex]}
          alt="Expanded attachment"
          className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] object-contain rounded-xl shadow-2xl"
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
    </div>,
    document.body,
  );
}
