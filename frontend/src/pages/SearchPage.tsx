import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Search, Calendar as CalendarIcon, MapPin, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { TIME_SLOTS } from '@/lib/time-slots'
import { SearchResultItem } from '@/components/SearchResultItem'
import { searchRestaurants, getVenuePhoto } from '@/lib/api'

// Mock data for filters
const CUISINES = [
  'All Cuisines',
  'Italian',
  'Japanese',
  'American',
  'French',
  'Chinese',
  'Mexican',
  'Mediterranean',
  'Indian',
  'Thai',
  'Korean',
  'Spanish',
  'Greek',
  'Vietnamese',
]

const NEIGHBORHOODS = [
  'All Neighborhoods',
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
  'West Village',
  'East Village',
  'SoHo',
  'Tribeca',
  'Chelsea',
  'Upper East Side',
  'Upper West Side',
  'Williamsburg',
  'DUMBO',
]

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: '$', value: '1' },
  { label: '$$', value: '2' },
  { label: '$$$', value: '3' },
  { label: '$$$$', value: '4' },
]

interface SearchFilters {
  query: string
  partySize: string
  date: Date | undefined
  time: string
  cuisines: string[]
  neighborhoods: string[]
  priceRanges: string[]
  bookmarkedOnly: boolean
  availableOnly: boolean
}

export function SearchPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    partySize: '2',
    date: undefined,
    time: '19:00',
    cuisines: [],
    neighborhoods: [],
    priceRanges: [],
    bookmarkedOnly: false,
    availableOnly: false,
  })

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!filters.query.trim()) {
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const results = await searchRestaurants(filters.query)

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

      setSearchResults(resultsWithImages)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVenue = (venueId: string) => {
    navigate(`/venue?id=${venueId}`)
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Left Side - Search Filters and Results */}
          <div className="flex flex-col w-3/5 gap-6">
            {/* Search Filters Card */}
            <Card className='py-2'>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-query">Restaurant Name</Label>
                  <div className="relative">
                    <Input
                      id="search-query"
                      placeholder="e.g., Carbone, Torrisi"
                      value={filters.query}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch()
                        }
                      }}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Party Size */}
                  <div className="space-y-2">
                    <Label htmlFor="party-size">Party Size</Label>
                    <Select
                      value={filters.partySize}
                      onValueChange={(value) => setFilters({ ...filters, partySize: value })}
                    >
                      <SelectTrigger id="party-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} {size === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-accent/50 transition-colors",
                            !filters.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {filters.date ? format(filters.date, 'MMM d, yyyy') : <span>Pick a date</span>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.date}
                          onSelect={(date) => setFilters({ ...filters, date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="time">Desired Time</Label>
                    <Select
                      value={filters.time}
                      onValueChange={(value) => setFilters({ ...filters, time: value })}
                    >
                      <SelectTrigger id="time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Cuisine Multi-Select */}
                  <div className="space-y-2">
                    <Label>Cuisine</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {filters.cuisines.length === 0 ? (
                            'All Cuisines'
                          ) : filters.cuisines.length === 1 ? (
                            filters.cuisines[0]
                          ) : (
                            `${filters.cuisines.length} selected`
                          )}
                          <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="max-h-[300px] overflow-y-auto p-2">
                          {CUISINES.filter(c => c !== 'All Cuisines').map((cuisine) => (
                            <div key={cuisine} className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded-sm">
                              <Checkbox
                                id={`cuisine-${cuisine}`}
                                checked={filters.cuisines.includes(cuisine)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({ ...filters, cuisines: [...filters.cuisines, cuisine] })
                                  } else {
                                    setFilters({ ...filters, cuisines: filters.cuisines.filter(c => c !== cuisine) })
                                  }
                                }}
                              />
                              <label
                                htmlFor={`cuisine-${cuisine}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {cuisine}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Neighborhood Multi-Select */}
                  <div className="space-y-2">
                    <Label>Neighborhood</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {filters.neighborhoods.length === 0 ? (
                            'All Neighborhoods'
                          ) : filters.neighborhoods.length === 1 ? (
                            filters.neighborhoods[0]
                          ) : (
                            `${filters.neighborhoods.length} selected`
                          )}
                          <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="max-h-[300px] overflow-y-auto p-2">
                          {NEIGHBORHOODS.filter(n => n !== 'All Neighborhoods').map((neighborhood) => (
                            <div key={neighborhood} className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded-sm">
                              <Checkbox
                                id={`neighborhood-${neighborhood}`}
                                checked={filters.neighborhoods.includes(neighborhood)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({ ...filters, neighborhoods: [...filters.neighborhoods, neighborhood] })
                                  } else {
                                    setFilters({ ...filters, neighborhoods: filters.neighborhoods.filter(n => n !== neighborhood) })
                                  }
                                }}
                              />
                              <label
                                htmlFor={`neighborhood-${neighborhood}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {neighborhood}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Price Range Multi-Select */}
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {filters.priceRanges.length === 0 ? (
                            'All Prices'
                          ) : filters.priceRanges.length === 1 ? (
                            PRICE_RANGES.find(p => p.value === filters.priceRanges[0])?.label
                          ) : (
                            `${filters.priceRanges.length} selected`
                          )}
                          <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="max-h-[300px] overflow-y-auto p-2">
                          {PRICE_RANGES.filter(p => p.value !== 'all').map((price) => (
                            <div key={price.value} className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded-sm">
                              <Checkbox
                                id={`price-${price.value}`}
                                checked={filters.priceRanges.includes(price.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({ ...filters, priceRanges: [...filters.priceRanges, price.value] })
                                  } else {
                                    setFilters({ ...filters, priceRanges: filters.priceRanges.filter(p => p !== price.value) })
                                  }
                                }}
                              />
                              <label
                                htmlFor={`price-${price.value}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {price.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={filters.availableOnly}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, availableOnly: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="available"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Available restaurants only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bookmarked"
                        checked={filters.bookmarkedOnly}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, bookmarkedOnly: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="bookmarked"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Bookmarked places only
                      </label>
                    </div>
                  </div>

                </div>
                <div className='mt-8'>
                  <Button onClick={handleSearch} disabled={!filters.query.trim() || loading}>
                    {loading ? 'Searching...' : 'Search Restaurants'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading results...
                </div>
              )}

              {!loading && hasSearched && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No restaurants found. Try a different search.
                </div>
              )}

              {!loading && searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {searchResults.length} restaurant{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {searchResults.map((result) => (
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
                  </div>
                </div>
              )}

              {!loading && !hasSearched && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Search className="size-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">Search for Restaurants</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Enter a restaurant name and customize your filters to find the perfect dining experience in NYC
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Google Maps */}
          <div className="w-4/5">
            <Card className="h-full py-0">
              <CardContent className="p-0 h-full">
                <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="size-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Map view coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
