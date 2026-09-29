import Link from "next/link"

import { cn } from "@/lib/utils"
import { PageCarousel } from "@/lib/wiki/load-carousel"
import { PageInfo } from "@/lib/wiki/load-page-info"
import { WikiContent } from "@/components/wiki/WikiContent"
import { WikiImageCarousel } from "@/components/wiki/WikiImageCarousel"
import { WikiPageInfo } from "@/components/wiki/WikiPageInfo"

interface WikiPageLayoutProps {
  title: string
  html: string
  carousel?: PageCarousel | null
  imageUrl?: string | null
  info?: PageInfo | null
}

export function WikiPageLayout({
  title,
  html,
  carousel,
  imageUrl,
  info,
}: WikiPageLayoutProps) {
  const displayTitle = info?.title ?? title
  const hasCarousel = Boolean(carousel?.items.length)
  const hasImage = hasCarousel || Boolean(imageUrl)

  return (
    <article className="container py-8 ">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </nav>
      <header className="mb-4 pb-4">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      </header>
      <div className="flex flex-col md:block">
        <aside
          className={cn(
            "mb-4 w-full border border-border p-2 md:float-right md:ml-6",
            hasImage
              ? "md:w-auto md:max-w-[350px]"
              : "md:w-full md:min-w-[280px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[350px]"
          )}
        >
          <figure className="">
            <div className="rounded-none">
              {hasCarousel && carousel ? (
                <WikiImageCarousel
                  items={carousel.items}
                  initialIndex={carousel.initialIndex}
                  pageTitle={title}
                />
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div
                  className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground"
                  aria-hidden
                >
                  No image
                </div>
              )}
            </div>
            {!hasCarousel ? (
              <figcaption className=" text-center text-sm italic text-muted-foreground">
                {displayTitle}
              </figcaption>
            ) : null}
          </figure>
          {info ? <WikiPageInfo info={info} /> : null}
        </aside>
        <WikiContent html={html} />
      </div>
    </article>
  )
}
