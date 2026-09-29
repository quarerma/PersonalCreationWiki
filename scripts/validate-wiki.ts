import { existsSync, readFileSync, statSync, writeFileSync } from "fs"
import path from "path"

import { MANIFEST_PATH, PAGES_DIR, ROUTER_PATH } from "../lib/wiki/paths"
import { RESERVED_SLUGS, RouterConfig, WikiManifest } from "../lib/wiki/types"

function fail(message: string): never {
  console.error(`[validate-wiki] ${message}`)
  process.exit(1)
}

function validateWiki(): void {
  if (!existsSync(ROUTER_PATH)) {
    fail(`Missing router file: ${ROUTER_PATH}`)
  }

  const config = JSON.parse(readFileSync(ROUTER_PATH, "utf-8")) as RouterConfig

  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    fail("router.json must contain a non-empty pages array")
  }

  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  const manifestPages: WikiManifest["pages"] = []

  for (const entry of config.pages) {
    if (!entry.url || !entry.title) {
      fail("Each page must have url and title")
    }

    if (RESERVED_SLUGS.has(entry.url)) {
      fail(`Reserved slug used in router: ${entry.url}`)
    }

    if (seenUrls.has(entry.url)) {
      fail(`Duplicate url in router: ${entry.url}`)
    }
    seenUrls.add(entry.url)

    const normalizedTitle = entry.title.trim().toLowerCase()
    if (seenTitles.has(normalizedTitle)) {
      fail(`Duplicate title in router: ${entry.title}`)
    }
    seenTitles.add(normalizedTitle)

    const folder = entry.folder ?? entry.url
    const contentPath = path.join(PAGES_DIR, folder, "content.md")

    if (!existsSync(contentPath)) {
      fail(`Missing content.md for page "${entry.title}" at ${contentPath}`)
    }

    const stats = statSync(contentPath)
    manifestPages.push({
      url: entry.url,
      title: entry.title,
      folder,
      contentPath: path.relative(process.cwd(), contentPath),
      contentModifiedAt: stats.mtime.toISOString(),
    })
  }

  const manifest: WikiManifest = {
    generatedAt: new Date().toISOString(),
    pages: manifestPages,
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n")
  console.log(
    `[validate-wiki] OK — ${manifestPages.length} page(s) validated, manifest written`
  )
}

validateWiki()
