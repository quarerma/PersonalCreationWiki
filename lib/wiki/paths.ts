import path from "path"

export const CONTENT_DIR = path.join(process.cwd(), "content")
export const PAGES_DIR = path.join(CONTENT_DIR, "pages")
export const ROUTER_PATH = path.join(CONTENT_DIR, "router.json")
export const MANIFEST_PATH = path.join(CONTENT_DIR, "wiki-manifest.json")

export function getPageContentPath(folder: string): string {
  return path.join(PAGES_DIR, folder, "content.md")
}

export function getPageImagesDir(folder: string): string {
  return path.join(PAGES_DIR, folder, "images")
}

export function getPageInfoPath(folder: string): string {
  return path.join(PAGES_DIR, folder, "info.json")
}

export function getPageCarouselPath(folder: string): string {
  return path.join(PAGES_DIR, folder, "carousel.json")
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
