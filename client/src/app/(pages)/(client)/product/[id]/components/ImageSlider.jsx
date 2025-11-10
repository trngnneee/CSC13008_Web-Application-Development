"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"

export const ImageSlider = () => {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imgSlide = [
    "/product.png",
    "/product2.png",
    "/product.png",
    "/product2.png",
    "/product2.png",
    "/product.png",
    "/product2.png",
  ]

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api])

  return (
    <>
      <div className="w-1/2">
        <div className="overflow-hidden rounded-[10px]">
          <img
            src={imgSlide[currentIndex]}
            className="w-full h-[400px] object-cover"
          />

          <div className="text-muted-foreground py-2 text-center text-sm">
            Ảnh {currentIndex + 1} của {imgSlide.length}
          </div>
        </div>

        <Carousel
          className="mt-3"
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setApi}
        >
          <CarouselContent className="-ml-2">
            {imgSlide.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-2 basis-1/5"
                onClick={() => api?.scrollTo(index)}
              >
                <div className="w-full overflow-hidden rounded-[5px]">
                  <img
                    src={item}
                    className="w-full h-[100px] object-cover rounded-[5px]"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  )
}