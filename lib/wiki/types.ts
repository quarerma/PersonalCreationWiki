export interface WikiPageEntry {
  url: string
  title: string
  type?: string
  search_words?: string[]
  folder?: string
}

export interface RouterConfig {
  pages: WikiPageEntry[]
}

export interface WikiPage extends WikiPageEntry {
  folder: string
}

export interface WikiManifestEntry {
  url: string
  title: string
  folder: string
  contentPath: string
  contentModifiedAt: string
}

export interface WikiManifest {
  generatedAt: string
  pages: WikiManifestEntry[]
}

export interface WikiRegistry {
  pages: WikiPage[]
  bySlug: Map<string, WikiPage>
  byTitle: Map<string, WikiPage>
  bySearchWord: Map<string, WikiPage>
}

export const RESERVED_SLUGS = new Set([
  "_next",
  "api",
  "wiki-assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
])
