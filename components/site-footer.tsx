import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          As imagens exibidas neste site são apenas para referência pessoal do
          universo. Não reivindico a propriedade de obras de terceiros. Se você
          é titular dos direitos e deseja a remoção de alguma imagem, entre em
          contato em{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
        <nav className="flex shrink-0 items-center space-x-1">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </div>
          </Link>
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.twitter className="h-5 w-5 fill-current" />
              <span className="sr-only">Twitter</span>
            </div>
          </Link>
          <Link
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </div>
          </Link>
        </nav>
      </div>
    </footer>
  )
}
