import { existsSync } from "fs"
import { readFile } from "fs/promises"

import { getPageInfoPath } from "@/lib/wiki/paths"

const METADATA_KEYS = new Set(["title"])

export type InfoFieldValue = string | number | string[]

export interface PageInfoSection {
  title: string
  fields: Array<{ key: string; value: InfoFieldValue }>
}

export interface PageInfo {
  title?: string
  sections: PageInfoSection[]
}

function normalizeFieldValue(value: unknown): InfoFieldValue {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value
  }
  return String(value)
}

function isSectionRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function loadPageInfo(folder: string): Promise<PageInfo | null> {
  const infoPath = getPageInfoPath(folder)

  if (!existsSync(infoPath)) {
    return null
  }

  const raw = await readFile(infoPath, "utf-8")
  const data = JSON.parse(raw) as Record<string, unknown>
  const title = typeof data.title === "string" ? data.title : undefined
  const sections: PageInfoSection[] = []

  for (const [key, value] of Object.entries(data)) {
    if (METADATA_KEYS.has(key) || !isSectionRecord(value)) {
      continue
    }

    sections.push({
      title: key,
      fields: Object.entries(value).map(([fieldKey, fieldValue]) => ({
        key: fieldKey,
        value: normalizeFieldValue(fieldValue),
      })),
    })
  }

  if (sections.length === 0 && !title) {
    return null
  }

  return { title, sections }
}
