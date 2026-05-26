const RECENTLY_VIEWED_KEY = 'ryze_recently_viewed'
const MAX_ITEMS = 8

export const addToRecentlyViewed = (product) => {
  if (!product) return

  const existing = getRecentlyViewed()
  const filtered = existing.filter(item => (item._id || item.id) !== (product._id || product.id))

  const updated = [product, ...filtered].slice(0, MAX_ITEMS)
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
}

export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('Failed to parse recently viewed', err)
    return []
  }
}
