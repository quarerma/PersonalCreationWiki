import { existsSync, readdirSync } from "fs"
import path from "path"

import { getPageImagesDir } from "@/lib/wiki/paths"

const PREFERRED_IMAGE_NAMES = ["portrait.png", "portrait.jpg", "portrait.jpeg"]

export function getPageImageUrl(folder: string): string | null {
  const imagesDir = getPageImagesDir(folder)

  if (!existsSync(imagesDir)) {
    return null
  }

  for (const name of PREFERRED_IMAGE_NAMES) {
    if (existsSync(path.join(imagesDir, name))) {
      return `/wiki-assets/${folder}/images/${name}`
    }
  }

  return null
}
