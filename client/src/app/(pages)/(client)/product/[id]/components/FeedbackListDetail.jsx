"use client"

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const FeedbackListDetail = ({ id_user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/feedback/${id_user}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setFeedbacks(data.data)
        });
    };
    fetchData();
  }, []);

  return (
    <>
      <Dialog>
        <DialogTrigger className="text-sm text-gray-600 hover:underline mb-5 translate-y-2.5">(Xem đánh giá)</DialogTrigger>
        <DialogContent
          style={{ maxWidth: "1000px" }}
        >
          <div className="space-y-4 mb-10">
            <DialogTitle className="text-[30px] font-extrabold mb-2.5">Đánh giá của Bidder này:</DialogTitle>
            {feedbacks.length > 0 ? feedbacks.map((fb, index) => (
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
            )) : (
              <p>Chưa có đánh giá nào.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};