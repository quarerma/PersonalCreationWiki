import Link from "next/link"
import { Fragment } from "react"

import { slugify } from "@/lib/wiki/paths"
import { resolveWikiLink } from "@/lib/wiki/registry"
import { wikiLinkClass, wikiLinkMissingClass } from "@/lib/wiki/tailwind-classes"

const WIKI_LINK_PATTERN = /\[\[([^\]]+)\]\]/g

interface WikiLinkTextProps {
  text: string
}

export function WikiLinkText({ text }: WikiLinkTextProps) {
  const parts: Array<{ type: "text"; value: string } | { type: "link"; href: string; label: string; exists: boolean }> = []
  let lastIndex = 0
  const pattern = new RegExp(WIKI_LINK_PATTERN.source, "g")
  let match = pattern.exec(text)

  while (match !== null) {
    const index = match.index

    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) })
    }

    const inner = match[1].trim()
    const segments = inner.split("|").map((part: string) => part.trim())
    const target = segments[0]
    const display = segments[1] ?? target
    const resolved = resolveWikiLink(target)
    const slug = resolved.exists ? resolved.slug : slugify(target)

    parts.push({
      type: "link",
      href: `/${slug}`,
      label: display,
      exists: resolved.exists,
    })

    lastIndex = index + match[0].length
    match = pattern.exec(text)
  }

  if (parts.length === 0) {
    return <>{text}</>
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) })
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <Fragment key={index}>{part.value}</Fragment>
        }

        return (
          <Link
            key={index}
            href={part.href}
            className={part.exists ? wikiLinkClass : wikiLinkMissingClass}
          >
            {part.label}
          </Link>
        )
      })}
    </>
  )
}
