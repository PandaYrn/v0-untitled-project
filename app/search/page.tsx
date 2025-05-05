"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResults } from "@/components/search/search-results"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(query)

    // Update URL with search query
    const url = new URL(window.location.href)
    url.searchParams.set("q", query)
    window.history.pushState({}, "", url)
  }

  // Update local state when URL changes
  useEffect(() => {
    setQuery(initialQuery)
    setSearchQuery(initialQuery)
  }, [initialQuery])

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search for music, movies, artists, or events..."
          className="max-w-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <SearchResults initialQuery={searchQuery} />
    </div>
  )
}
