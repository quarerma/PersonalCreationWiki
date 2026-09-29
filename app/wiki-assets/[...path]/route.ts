import { existsSync } from "fs"
import { readFileSync } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import { PAGES_DIR } from "@/lib/wiki/paths"

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path

  if (segments.length < 3 || segments[1] !== "images") {
    return new NextResponse("Not Found", { status: 404 })
  }

  const [folder, , ...fileParts] = segments
  const filename = fileParts.join("/")
  const filePath = path.join(PAGES_DIR, folder, "images", filename)
  const resolvedPath = path.resolve(filePath)
  const resolvedImagesDir = path.resolve(path.join(PAGES_DIR, folder, "images"))

  if (!resolvedPath.startsWith(resolvedImagesDir)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (!existsSync(resolvedPath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream"
  const fileBuffer = readFileSync(resolvedPath)

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
