"use client"

import { useCallback, useEffect, useState } from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { CarouselItem as WikiCarouselItem } from "@/lib/wiki/load-carousel"

interface WikiImageCarouselProps {
  items: WikiCarouselItem[]
  initialIndex: number
  pageTitle: string
}

export function WikiImageCarousel({
  items,
  initialIndex,
  pageTitle,
}: WikiImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const hasMultiple = items.length > 1
  const current = items[activeIndex]

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) {
      return
    }
    setActiveIndex(carouselApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <div>
      {current.label ? (
        <p className="my-1 border border-border bg-secondary text-center text-sm italic text-muted-foreground">
          {current.label}
        </p>
      ) : null}
      <Carousel
        setApi={setApi}
        opts={{
          startIndex: initialIndex,
          loop: hasMultiple,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {items.map((item) => (
            <CarouselItem key={item.url} className="pl-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.label || pageTitle}
                className="h-auto w-full object-cover"
                draggable={false}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {hasMultiple ? (
          <>
            <CarouselPrevious
              variant="secondary"
              className="left-1 top-1/2 h-8 w-8 -translate-y-1/2 border border-border bg-secondary opacity-80"
            />
            <CarouselNext
              variant="secondary"
              className="right-1 top-1/2 h-8 w-8 -translate-y-1/2 border border-border bg-secondary opacity-80"
            />
          </>
        ) : null}
      </Carousel>
      {hasMultiple ? (
        <div className="mb-2 mt-2 flex justify-center gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.url}
              type="button"
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === activeIndex
                  ? "bg-foreground"
                  : "bg-muted-foreground/40 hover:bg-muted-foreground/70"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
