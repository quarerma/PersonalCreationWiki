import { resolveWikiLink } from "@/lib/wiki/registry"
import { slugify } from "@/lib/wiki/paths"

const WIKI_LINK_PATTERN = /\[\[([^\]]+)\]\]/g

export function preprocessWikiLinks(markdown: string): string {
  return markdown.replace(WIKI_LINK_PATTERN, (_match, inner: string) => {
    const parts = inner.split("|").map((part) => part.trim())
    const target = parts[0]
    const display = parts[1] ?? target
    const resolved = resolveWikiLink(target)
    const slug = resolved.exists ? resolved.slug : slugify(target)

    return `[${display}](/${slug})`
  })
}
