import Link from "next/link"

import { WikiPage } from "@/lib/wiki/types"

interface PageListProps {
  pages: WikiPage[]
  imageUrlsByPage?: Record<string, string | null>
}

export function PageList({ pages, imageUrlsByPage }: PageListProps) {
  if (pages.length === 0) {
    return <p className="text-muted-foreground">No pages match your search.</p>
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => {
        const imageUrl = imageUrlsByPage?.[page.url] ?? null

        return (
          <li key={page.url}>
            <Link
              href={`/${page.url}`}
              className="flex h-[80px] space-x-4 items-center justify-between text-start rounded-lg border bg-card p-4 transition-all duration-700 ease-out hover:bg-accent hover:scale-105"
            >
              <h2 className="font-semibold ">{page.title}</h2>
              <img
                src={imageUrl ?? undefined}
                alt="?"
                className="max-h-[70px] rounded-sm"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
