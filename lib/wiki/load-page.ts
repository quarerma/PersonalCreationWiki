import { readFile } from "fs/promises"

import { getPageContentPath } from "@/lib/wiki/paths"
import { WikiPage } from "@/lib/wiki/types"

export interface LoadedPage {
  page: WikiPage
  markdown: string
  contentPath: string
}

export async function loadPageContent(page: WikiPage): Promise<LoadedPage> {
  const contentPath = getPageContentPath(page.folder)
  const markdown = await readFile(contentPath, "utf-8")

  return {
    page,
    markdown,
    contentPath,
  }
}
