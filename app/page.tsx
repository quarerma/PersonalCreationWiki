import Link from "next/link"

import { siteConfig } from "@/config/site"
import { getPageImageUrl } from "@/lib/wiki/page-image"
import { getAllPages } from "@/lib/wiki/registry"
import { wikiLinkClass } from "@/lib/wiki/tailwind-classes"
import { SearchBar } from "@/components/wiki/SearchBar"

export default function HomePage() {
  const pages = getAllPages().sort((a, b) => a.title.localeCompare(b.title))
  const imageUrlsByPage = Object.fromEntries(
    pages.map((page) => [page.url, getPageImageUrl(page.folder)])
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {siteConfig.description}
        </p>
      </div>
      <SearchBar pages={pages} imageUrlsByPage={imageUrlsByPage} />
      <p className="mt-8 text-sm text-muted-foreground">
        {pages.length} page{pages.length === 1 ? "" : "s"} in the wiki.
        {pages[0] && (
          <>
            {" "}
            <Link href={`/${pages[0].url}`} className={wikiLinkClass}>
              Browse an article
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
