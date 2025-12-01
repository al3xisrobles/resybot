import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useVenue } from '@/contexts/VenueContext'
import { searchRestaurants, getVenuePhoto } from '@/lib/api'
import { SearchResultItem } from '@/components/SearchResultItem'

interface SearchBarProps {
  className?: string
  inputClassName?: string
}

export function SearchBar({ className, inputClassName }: SearchBarProps) {
  const navigate = useNavigate()
  const {
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
  } = useVenue()
  const [loading, setLoading] = useState(false)
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentQueryRef = useRef<string>('')

  // Prevent body scroll when popover is open
  useEffect(() => {
    if (searchPopoverOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchPopoverOpen])

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value)
    currentQueryRef.current = value

    if (!value.trim()) {
      setSearchResults([])
      if (inputFocused) {
        setSearchPopoverOpen(true)
      }
      return
    }

    const querySnapshot = value
    setLoading(true)
    if (inputFocused) {
      setSearchPopoverOpen(true)
    }

    try {
      const results = await searchRestaurants(value)

      // Check if this query is still current
      if (currentQueryRef.current !== querySnapshot) {
        return // Ignore results from old queries
      }

      // Fetch images for all results
      const resultsWithImages = await Promise.all(
        results.map(async (result) => {
          try {
            const photoData = await getVenuePhoto(result.id, result.name)
            return { ...result, imageUrl: photoData.photoUrl }
          } catch {
            return { ...result, imageUrl: null }
          }
        })
      )

      // Check again after async operations
      if (currentQueryRef.current !== querySnapshot) {
        return // Ignore results from old queries
      }

      setSearchResults(resultsWithImages)
      if (inputFocused && (resultsWithImages.length > 0 || !value.trim())) {
        setSearchPopoverOpen(true)
      }
    } catch (err) {
      console.error('Search error:', err)
      if (currentQueryRef.current === querySnapshot) {
        setSearchPopoverOpen(false)
      }
    } finally {
      if (currentQueryRef.current === querySnapshot) {
        setLoading(false)
      }
    }
  }

  const handleSelectVenue = (venueId: string) => {
    setSearchPopoverOpen(false)
    setInputFocused(false)
    navigate(`/venue?id=${venueId}`)
  }

  const handleViewAll = () => {
    setSearchPopoverOpen(false)
    setInputFocused(false)
    navigate('/search')
  }

  return (
    <>
      {/* Backdrop overlay when searching */}
      {searchPopoverOpen && (
        <div
          className="fixed inset-0 bg-black/50"
          style={{ zIndex: 9998 }}
          onClick={() => {
            setSearchPopoverOpen(false)
            setInputFocused(false)
          }}
        />
      )}

      <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={className}
            style={{ position: 'relative', zIndex: 9999 }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Input
              ref={inputRef}
              placeholder="e.g., Carbone, Torrisi"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                setInputFocused(true)
                if (searchQuery.trim() || searchResults.length > 0) {
                  setSearchPopoverOpen(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setInputFocused(false)
                }, 200)
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              autoComplete="off"
              className={`shadow-md bg-background ${inputClassName}`}
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        style={{ zIndex: 9999 }}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading results...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {searchResults.slice(0, 5).map((result) => (
              <SearchResultItem
                key={result.id}
                id={result.id}
                name={result.name}
                type={result.type}
                priceRange={result.price_range}
                location={[result.neighborhood, result.locality, result.region]
                  .filter(Boolean)
                  .filter(item => item !== 'N/A')
                  .join(', ')}
                imageUrl={result.imageUrl || null}
                onClick={() => handleSelectVenue(result.id)}
              />
            ))}
            {searchResults.length > 5 && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleViewAll}
                >
                  See all {searchResults.length} results
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleViewAll}
            >
              <Search className="mr-2 size-4" />
              View all NYC restaurants
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
    </>
  )
}
