import { useState, useRef, useEffect } from 'react'

/**
 * OptimizedImage — Fast-loading image with blur-up placeholder + fade-in.
 * 
 * Features:
 * - Tiny blurred placeholder loaded first (20px wide via Unsplash params)
 * - Smooth fade-in when the full image finishes loading
 * - `decoding="async"` for non-blocking decode
 * - `fetchpriority` support for hero/above-fold images
 * - Intersection Observer lazy loading (native + polyfill)
 * - Automatic Unsplash URL optimization (appends size/quality params)
 */
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  priority = false,   // true for above-fold / hero images
  width,              // desired render width for optimization
  quality = 75,
  onClick,
  onError,
  style,
  objectFit = 'cover', // 'cover' (fill+crop) or 'contain' (show whole image)
}) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority) // priority images load immediately
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || inView) return
    const el = imgRef.current
    if (!el) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observerRef.current?.disconnect()
        }
      },
      { rootMargin: '200px' } // start loading 200px before viewport
    )
    observerRef.current.observe(el)

    return () => observerRef.current?.disconnect()
  }, [priority, inView])

  // Build optimized URLs from Unsplash sources
  const optimizeSrc = (url, w, q) => {
    if (!url) return url
    // For Unsplash images, optimize with params
    if (url.includes('unsplash.com')) {
      const base = url.split('?')[0]
      return `${base}?auto=format&fit=crop&w=${w}&q=${q}`
    }
    // Meesho images are hosted on their servers, which throttle hotlinking and
    // hang under load. We serve locally-downloaded copies from /public/products
    // instead (run download-images.mjs once to populate them).
    if (url.includes('images.meesho.com')) {
      const mm = url.match(/products\/(\d+)\/([a-z0-9]+)_/i)
      if (mm) return `/products/${mm[1]}_${mm[2]}.webp`
      return url
    }
    return url
  }

  const thumbSrc = optimizeSrc(src, 20, 20)     // tiny blurred placeholder
  const fullSrc = optimizeSrc(src, width || 800, quality)
  // Literal class names so Tailwind generates them.
  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover'
  // If a locally-hosted Meesho copy is missing, fall back to Meesho's resized URL.
  const meeshoFallback = src && src.includes('images.meesho.com')
    ? src.split('?')[0] + '?width=512'
    : null

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      onClick={onClick}
      style={style}
    >
      {/* Blurred placeholder - always loads instantly (20px image ~200 bytes) */}
      <img
        src={thumbSrc}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'} ${className}`}
        decoding="async"
      />

      {/* Full resolution image */}
      {inView && (
        <img
          src={fullSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            if (meeshoFallback && e.currentTarget.dataset.fb !== '1') {
              e.currentTarget.dataset.fb = '1'
              e.currentTarget.src = meeshoFallback
              return
            }
            if (onError) onError(e)
          }}
          className={`w-full h-full ${fitClass} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        />
      )}

      {/* Skeleton pulse while not loaded */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
      )}
    </div>
  )
}
