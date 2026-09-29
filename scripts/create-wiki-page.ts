import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import path from "path"

import {
  PAGES_DIR,
  ROUTER_PATH,
  getPageContentPath,
  getPageImagesDir,
  getPageInfoPath,
  slugify,
} from "../lib/wiki/paths"
import { RESERVED_SLUGS, RouterConfig } from "../lib/wiki/types"

const PAGE_TEMPLATES_DIR = path.join(__dirname, "page-templates")

const INFO_TEMPLATES: Record<string, string> = {
  character: path.join(PAGE_TEMPLATES_DIR, "character-info.json"),
  location: path.join(PAGE_TEMPLATES_DIR, "location-info.json"),
  god: path.join(PAGE_TEMPLATES_DIR, "god-info.json"),
}

function usage(): never {
  console.error(`Usage: npm run create-page -- <slug> [title] [--type <type>] [--skip-router]

  slug          URL slug and folder name (e.g. "araleth")
  title         Display title (defaults to slug)
  --type        Page type (e.g. "character", "location")
  --skip-router Create files only, do not update router.json`)
  process.exit(1)
}

function fail(message: string): never {
  console.error(`[create-page] ${message}`)
  process.exit(1)
}

function capitalizeTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) {
    return trimmed
  }

  return trimmed
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function titleFromSlug(slug: string): string {
  return capitalizeTitle(slug.split("-").filter(Boolean).join(" "))
}

function parseArgs(argv: string[]): {
  slug: string
  title: string
  type?: string
  skipRouter: boolean
} {
  const args = argv.filter((arg) => arg !== "--")
  let skipRouter = false
  let type: string | undefined
  const positional: string[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === "--skip-router") {
      skipRouter = true
      continue
    }

    if (arg === "--type") {
      const value = args[i + 1]
      if (!value || value.startsWith("--")) {
        fail("Missing value for --type")
      }
      type = value
      consumed.add(i + 1)
      continue
    }

    if (arg.startsWith("--type=")) {
      const value = arg.slice("--type=".length)
      if (!value) {
        fail("Missing value for --type")
      }
      type = value
      continue
    }

    if (arg.startsWith("--")) {
      fail(`Unknown flag: ${arg}`)
    }

    if (!consumed.has(i)) {
      positional.push(arg)
    }
  }

  if (positional.length === 0) {
    usage()
  }

  const slug = slugify(positional[0])
  if (!slug) {
    fail(`Invalid slug: "${positional[0]}"`)
  }

  if (slug !== positional[0]) {
    console.log(`[create-page] Normalized slug: ${slug}`)
  }

  // If the user provided an explicit title use it verbatim; otherwise
  // generate a title from the slug and normalize capitalization.
  const title =
    positional[1] !== undefined ? positional[1].trim() : titleFromSlug(slug)

  return { slug, title, type, skipRouter }
}

function getDefaultInfo(title: string, type?: string): Record<string, unknown> {
  const templatePath = type && INFO_TEMPLATES[type]
  if (!templatePath) {
    return { title }
  }

  if (!existsSync(templatePath)) {
    fail(`Missing info template for type "${type}": ${templatePath}`)
  }

  const template = JSON.parse(readFileSync(templatePath, "utf-8")) as Record<
    string,
    unknown
  >

  return { title, ...template }
}

function validateSlug(slug: string, title: string, router: RouterConfig): void {
  if (RESERVED_SLUGS.has(slug)) {
    fail(`Reserved slug: ${slug}`)
  }

  const pageDir = path.join(PAGES_DIR, slug)
  if (existsSync(pageDir)) {
    fail(`Page folder already exists: ${pageDir}`)
  }

  if (router.pages.some((entry) => entry.url === slug)) {
    fail(`Slug already registered in router.json: ${slug}`)
  }

  const normalizedTitle = title.trim().toLowerCase()
  if (
    router.pages.some(
      (entry) => entry.title.trim().toLowerCase() === normalizedTitle
    )
  ) {
    fail(`Duplicate title in router.json: ${title}`)
  }
}

function createPageFiles(slug: string, title: string, type?: string): void {
  const pageDir = path.join(PAGES_DIR, slug)
  const imagesDir = getPageImagesDir(slug)

  mkdirSync(imagesDir, { recursive: true })
  writeFileSync(
    getPageContentPath(slug),
    `**${title}**\n\nWrite your page content here.\n`,
    "utf-8"
  )
  writeFileSync(
    getPageInfoPath(slug),
    JSON.stringify(getDefaultInfo(title, type), null, 2) + "\n",
    "utf-8"
  )
  writeFileSync(path.join(imagesDir, ".gitkeep"), "", "utf-8")

  console.log(`[create-page] Created ${path.relative(process.cwd(), pageDir)}/`)
  console.log(`  - content.md`)
  console.log(`  - info.json`)
  console.log(`  - images/`)
}

function addToRouter(slug: string, title: string, type?: string): void {
  const router = JSON.parse(readFileSync(ROUTER_PATH, "utf-8")) as RouterConfig

  router.pages.push({
    url: slug,
    title,
    ...(type && { type }),
    search_words: [slug],
  })

  writeFileSync(ROUTER_PATH, JSON.stringify(router, null, 2) + "\n", "utf-8")
  const typeLabel = type ? `, type: ${type}` : ""
  console.log(
    `[create-page] Added "${title}" to router.json (/${slug}${typeLabel})`
  )
}

function main(): void {
  const { slug, title, type, skipRouter } = parseArgs(process.argv.slice(2))

  if (!existsSync(ROUTER_PATH)) {
    fail(`Missing router file: ${ROUTER_PATH}`)
  }

  const router = JSON.parse(readFileSync(ROUTER_PATH, "utf-8")) as RouterConfig
  validateSlug(slug, title, router)
  createPageFiles(slug, title, type)

  if (!skipRouter) {
    addToRouter(slug, title, type)
  }

  console.log(
    `[create-page] Done. Run "npm run validate-wiki" to refresh the manifest.`
  )
}

main()
