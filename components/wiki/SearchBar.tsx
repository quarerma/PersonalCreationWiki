"use client"

import { useMemo, useState } from "react"

import { WikiPage } from "@/lib/wiki/types"
import { PageList } from "@/components/wiki/PageList"

interface SearchBarProps {
  pages: WikiPage[]
  imageUrlsByPage?: Record<string, string | null>
}
const sectionOrder = [
  "character",
  "adventuring_party",
  "institution",
  "organization",
  "establishment",
  "god",
  "entity",
  "religious-organization",
  "location",
] as const

// Runtime mapping from page type -> displayed label. Add entries here
// when you introduce new types. This keeps the UI flexible while
// avoiding an exhaustive TypeScript union that needs frequent updates.
const PAGE_TYPE_LABELS: Record<string, string> = {
  character: "Personagens",
  location: "Locais",
  adventuring_party: "Grupos de Aventureiros",
  god: "Deuses",
  organization: "Organizações",
  establishment: "Estabelecimentos",
  "religious-organization": "Organizações Religiosas",
  institution: "Instituições",
  entity: "Entidades",
}

const pageTypeParser = (type: string) => PAGE_TYPE_LABELS[type] ?? "Páginas"

export function SearchBar({ pages, imageUrlsByPage }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const filteredPages = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return pages
    }

    return pages.filter((page) => {
      const haystack = [page.title, page.url, ...(page.search_words ?? [])]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalized)
    })
  }, [pages, query])

  const groupedPages = useMemo(() => {
    return filteredPages.reduce<Record<string, WikiPage[]>>((groups, page) => {
      const type = page.type ?? "page"

      if (!groups[type]) {
        groups[type] = []
      }

      groups[type].push(page)

      return groups
    }, {})
  }, [filteredPages])

  return (
    <div className="space-y-6">
      <input
        type="search"
        placeholder="Search pages..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="space-y-8">
        {sectionOrder
          .filter((type) => groupedPages[type]?.length)
          .map((type) => (
            <section key={type} className="space-y-3">
              <h2 className="text-xl font-semibold">{pageTypeParser(type)}</h2>

              <PageList
                pages={groupedPages[type]}
                imageUrlsByPage={imageUrlsByPage}
              />
            </section>
          ))}

        {Object.entries(groupedPages)
          .filter(
            ([type]) =>
              !sectionOrder.includes(type as (typeof sectionOrder)[number])
          )
          .map(([type, pages]) => (
            <section key={type} className="space-y-3">
              <h2 className="text-xl font-semibold">{pageTypeParser(type)}</h2>

              <PageList pages={pages} imageUrlsByPage={imageUrlsByPage} />
            </section>
          ))}
      </div>
    </div>
  )
}
