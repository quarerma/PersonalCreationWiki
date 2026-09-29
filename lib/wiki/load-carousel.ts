import { existsSync } from "fs"
import { readFile } from "fs/promises"

import { getPageCarouselPath } from "@/lib/wiki/paths"

export interface CarouselItem {
  url: string
  label: string
}

export interface PageCarousel {
  items: CarouselItem[]
  initialIndex: number
}

function getPageImageAssetUrl(folder: string, imageName: string): string {
  return `/wiki-assets/${folder}/images/${imageName}`
}

function isCarouselEntry(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function loadPageCarousel(folder: string): Promise<PageCarousel | null> {
  const carouselPath = getPageCarouselPath(folder)

  if (!existsSync(carouselPath)) {
    return null
  }

  const raw = await readFile(carouselPath, "utf-8")
  const data = JSON.parse(raw) as unknown

  if (!Array.isArray(data)) {
    return null
  }

  const items: CarouselItem[] = []
  let initialIndex = -1

  for (const entry of data) {
    if (!isCarouselEntry(entry) || typeof entry.image_name !== "string") {
      continue
    }

    const index = items.length
    items.push({
      url: getPageImageAssetUrl(folder, entry.image_name),
      label: typeof entry.image_label === "string" ? entry.image_label : "",
    })

    if (initialIndex === -1 && entry.display_default === true) {
      initialIndex = index
    }
  }

  if (items.length === 0) {
    return null
  }

  return {
    items,
    initialIndex: initialIndex === -1 ? 0 : initialIndex,
  }
}
