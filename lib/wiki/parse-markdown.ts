import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import {
  rehypeWikiImages,
  rehypeWikiLinkClasses,
} from "@/lib/wiki/remark-wiki-images"
import { preprocessWikiLinks } from "@/lib/wiki/remark-wiki-links"

export async function parseMarkdown(
  markdown: string,
  folder: string
): Promise<string> {
  const preprocessed = preprocessWikiLinks(markdown)

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeWikiImages, folder)
    .use(rehypeWikiLinkClasses)
    .use(rehypeStringify)
    .process(preprocessed)

  return String(result)
}
