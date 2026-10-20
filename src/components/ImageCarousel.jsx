import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageCarousel({ images, onImageClick, className = '' }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const count = images.length

  const stop = (event) => event.stopPropagation()

  const openImage = (event, i) => {
    stop(event)
    onImageClick?.(i)
  }

  // A single image is shown at its full size, no carousel needed.
  if (count === 1) {
    return (
      <button
        type="button"
        onClick={(event) => openImage(event, 0)}
        className={`block w-full cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 ${className}`}
      >
        <img
          src={images[0]}
          alt="Attachment"
          className="block h-auto max-h-[70vh] w-full object-contain"
        />
      </button>
    )
  }

  const scrollToIndex = (next) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || !track.clientWidth) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-black/10 dark:border-neutral-800 ${className}`}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <button
            type="button"
            key={`${src}-${i}`}
            onClick={(event) => openImage(event, i)}
            className="flex h-80 w-full shrink-0 snap-center cursor-pointer items-center justify-center bg-neutral-100 dark:bg-neutral-950"
          >
            <img
              src={src}
              alt={`Attachment ${i + 1} of ${count}`}
              className="h-full w-full object-contain"
            />
          </button>
        ))}
      </div>

      {index > 0 && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(event) => {
            stop(event)
            scrollToIndex(index - 1)
          }}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 sm:block"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {index < count - 1 && (
        <button
          type="button"
          aria-label="Next image"
          onClick={(event) => {
            stop(event)
            scrollToIndex(index + 1)
          }}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 sm:block"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
      <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === index ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
