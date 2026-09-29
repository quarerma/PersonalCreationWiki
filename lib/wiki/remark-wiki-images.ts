import type { Element, ElementContent, Root as HastRoot } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { getRegistry } from "@/lib/wiki/registry"
import {
  wikiLinkClass,
  wikiLinkMissingClass,
} from "@/lib/wiki/tailwind-classes"

function rewriteImageSrc(src: string, folder: string): string {
  return `/wiki-assets/${folder}/images/${src}`
}

function isFloatAlt(alt: unknown): alt is "left" | "right" {
  return alt === "left" || alt === "right"
}

function paragraphHasFloatImg(node: Element): boolean {
  return node.children.some(
    (child) =>
      child.type === "element" &&
      child.tagName === "img" &&
      isFloatAlt(child.properties?.alt)
  )
}

function appendClassName(existing: unknown, extra: string): string {
  const base = Array.isArray(existing)
    ? existing
        .filter((value): value is string => typeof value === "string")
        .join(" ")
    : typeof existing === "string"
    ? existing
    : ""

  return base ? `${base} ${extra}` : extra
}

interface FloatWrapTarget {
  parent: HastRoot | Element
  startIndex: number
  endIndex: number
}

function isWrapContainer(node: unknown): node is HastRoot | Element {
  if (typeof node !== "object" || node === null || !("type" in node)) {
    return false
  }

  const type = (node as { type: string }).type
  return type === "root" || type === "element"
}

function isIgnorableText(node: HastRoot["children"][number]): boolean {
  return node.type === "text" && node.value.trim() === ""
}

function collectFloatWrapTargets(tree: HastRoot): FloatWrapTarget[] {
  const targets: FloatWrapTarget[] = []

  visit(tree, "element", (node, _index, parent) => {
    if (node.tagName !== "p" || !isWrapContainer(parent)) {
      return
    }

    if (!paragraphHasFloatImg(node)) {
      return
    }

    const startIndex = parent.children.indexOf(node)
    if (startIndex === -1) {
      return
    }

    let endIndex = startIndex + 1
    while (endIndex < parent.children.length) {
      const sibling = parent.children[endIndex]
      if (isIgnorableText(sibling)) {
        endIndex++
        continue
      }
      if (sibling.type !== "element" || sibling.tagName !== "p") {
        break
      }
      if (paragraphHasFloatImg(sibling)) {
        break
      }
      endIndex++
    }

    targets.push({ parent, startIndex, endIndex })
  })

  return targets
}

function applyFloatWraps(targets: FloatWrapTarget[]): void {
  targets.sort((a, b) => {
    if (a.parent !== b.parent) {
      return 0
    }
    return b.startIndex - a.startIndex
  })

  for (const { parent, startIndex, endIndex } of targets) {
    const wrapper: Element = {
      type: "element",
      tagName: "div",
      properties: { className: "wiki-float-wrap overflow-hidden" },
      children: parent.children.slice(startIndex, endIndex) as ElementContent[],
    }
    parent.children.splice(startIndex, endIndex - startIndex, wrapper)
  }
}

export const rehypeWikiImages: Plugin<[string], HastRoot> = (folder) => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img" || !node.properties) {
        return
      }

      const src = node.properties.src
      if (typeof src === "string") {
        node.properties.src = rewriteImageSrc(src, folder)
      }

      node.properties.className = appendClassName(
        node.properties.className,
        "cursor-pointer"
      )
      node.properties.onclick =
        "window.open(this.getAttribute('src'), '_blank', 'noopener,noreferrer')"

      const alt = node.properties.alt
      if (!isFloatAlt(alt)) {
        return
      }

      const floatDirection =
        alt === "right"
          ? "float-right ml-4 mb-2 mt-2"
          : "float-left mr-4 mb-2 mt-2"

      node.properties.className = appendClassName(
        node.properties.className,
        `max-h-[250px] ${floatDirection} block`
      )
    })

    applyFloatWraps(collectFloatWrapTargets(tree))
  }
}

export const rehypeWikiLinkClasses: Plugin<[], HastRoot> = () => {
  return (tree) => {
    const registry = getRegistry()

    visit(tree, "element", (node) => {
      if (node.tagName !== "a" || !node.properties) {
        return
      }

      const href = node.properties.href
      if (typeof href !== "string" || !href.startsWith("/")) {
        return
      }

      const slug = href.slice(1)
      const exists = registry.bySlug.has(slug)
      node.properties.className = exists ? wikiLinkClass : wikiLinkMissingClass
    })
  }
}
