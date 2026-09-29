interface WikiContentProps {
  html: string
}

export function WikiContent({ html }: WikiContentProps) {
  return (
    <div
      className="prose prose-neutral max-w-none dark:prose-invert prose-a:no-underline [&_h2:not(:first-child)]:mt-8 [&_h2:not(:first-child)]:border-t [&_h2:not(:first-child)]:border-border [&_h2:not(:first-child)]:pt-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
