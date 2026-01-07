"use client"

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export const FeedbackList = () => {
  const { id } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}/feedback`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          setFeedbacks(data.data)
        });
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="space-y-4 mb-10 max-h-[500px] overflow-y-auto bg-white shadow-xl border border-gray-100 p-10 rounded-xl">
        <div className="text-[30px] font-extrabold mb-2.5">Đánh giá của người dùng cho sản phẩm này:</div>
        {feedbacks.length > 0 && feedbacks.map((fb, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-lg border p-4"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{fb.fullname} - ({fb.rating_point})</h4>
              </div>

              <div className="flex items-center gap-1">
                {fb.rating_point == 1 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-gray-300"
                    />
                  ))
                )}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {fb.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};