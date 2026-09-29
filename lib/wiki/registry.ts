import { readFileSync } from "fs"

import { ROUTER_PATH } from "@/lib/wiki/paths"
import {
  RESERVED_SLUGS,
  RouterConfig,
  WikiPage,
  WikiRegistry,
} from "@/lib/wiki/types"

function normalizeLookup(text: string): string {
  return text.trim().toLowerCase()
}

function buildRegistry(config: RouterConfig): WikiRegistry {
  const pages: WikiPage[] = config.pages.map((entry) => ({
    ...entry,
    folder: entry.folder ?? entry.url,
    search_words: entry.search_words ?? [],
  }))

  const bySlug = new Map<string, WikiPage>()
  const byTitle = new Map<string, WikiPage>()
  const bySearchWord = new Map<string, WikiPage>()

  for (const page of pages) {
    bySlug.set(page.url, page)
    byTitle.set(normalizeLookup(page.title), page)

    for (const word of page.search_words ?? []) {
      bySearchWord.set(normalizeLookup(word), page)
    }
  }

  return { pages, bySlug, byTitle, bySearchWord }
}

let cachedRegistry: WikiRegistry | null = null

export function getRegistry(): WikiRegistry {
  if (cachedRegistry) {
    return cachedRegistry
  }

  const raw = readFileSync(ROUTER_PATH, "utf-8")
  const config = JSON.parse(raw) as RouterConfig
  cachedRegistry = buildRegistry(config)
  return cachedRegistry
}

export function getAllPages(): WikiPage[] {
  return getRegistry().pages
}

export function getPageBySlug(slug: string): WikiPage | undefined {
  if (RESERVED_SLUGS.has(slug)) {
    return undefined
  }
  return getRegistry().bySlug.get(slug)
}

export function getPageByTitle(title: string): WikiPage | undefined {
  return getRegistry().byTitle.get(normalizeLookup(title))
}

export function resolveWikiLink(target: string): {
  page?: WikiPage
  slug: string
  exists: boolean
} {
  const registry = getRegistry()
  const key = normalizeLookup(target)

  const byTitle = registry.byTitle.get(key)
  if (byTitle) {
    return { page: byTitle, slug: byTitle.url, exists: true }
  }

  const bySlug = registry.bySlug.get(key)
  if (bySlug) {
    return { page: bySlug, slug: bySlug.url, exists: true }
  }

  const bySearchWord = registry.bySearchWord.get(key)
  if (bySearchWord) {
    return { page: bySearchWord, slug: bySearchWord.url, exists: true }
  }

  const slug = target
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return { slug, exists: false }
}
