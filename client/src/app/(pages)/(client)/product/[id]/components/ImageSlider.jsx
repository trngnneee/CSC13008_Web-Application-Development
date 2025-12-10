"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"

export const ImageSlider = ({ imageList }) => {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api])

  return (
    <>
      {imageList && (
        <div className="w-1/2">
          <div className="overflow-hidden rounded-[10px] h-[400px]">
            <img
              src={imageList[currentIndex]}
              className="w-full h-full object-contain"
            />

            <div className="text-muted-foreground py-2 text-center text-sm">
              Ảnh {currentIndex + 1} của {imageList.length}
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
              {imageList.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 basis-1/2"
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
      )}
    </>
  )
}