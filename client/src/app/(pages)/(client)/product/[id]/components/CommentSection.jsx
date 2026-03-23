"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dateTimeFormat } from "@/utils/date";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { commentTreeFormat } from "@/helper/comment";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { socket } from "@/lib/socket";

export function CommentSection() {
  const { id } = useParams();
  const { userInfo } = useClientAuthContext();
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    // Join the product comment room
    socket.emit("comment:join", { id_product: id });

    // Request initial comment list
    socket.emit("comment:list", { id_product: id });

    // Listen for the full comment list
    const handleList = (comments) => {
      const mapped = commentTreeFormat(comments);
      setCommentList(mapped);
    };

    // Listen for new comments broadcast in real-time
    const handleNew = (data) => {
      setCommentList((prev) => {
        if (data.id_parent_comment) {
          // It's a reply — add to the parent's replies
          return prev.map((cmt) =>
            cmt.id === data.id_parent_comment
              ? {
                  ...cmt,
                  replies: [
                    ...cmt.replies,
                    {
                      id: data.id_comment,
                      parentId: data.id_parent_comment,
                      replyTo: data.reply_to_user,
                      user: data.user_name,
                      avatar:
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(data.user_name),
                      time: new Date(data.created_at).toISOString(),
                      content: data.content,
                    },
                  ],
                }
              : cmt
          );
        }
        // It's a root comment — prepend
        return [
          {
            id: data.id_comment,
            user: data.user_name,
            avatar:
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(data.user_name),
            time: new Date(data.created_at).toISOString(),
            content: data.content,
            replies: [],
          },
          ...prev,
        ];
      });
    };

    const handleError = (err) => {
      toast.error(err.message || "Lỗi bình luận");
    };

    socket.on("comment:list", handleList);
    socket.on("comment:new", handleNew);
    socket.on("comment:error", handleError);

    return () => {
      socket.emit("comment:leave", { id_product: id });
      socket.off("comment:list", handleList);
      socket.off("comment:new", handleNew);
      socket.off("comment:error", handleError);
    };
  }, [id]);

  const handleSendComment = useCallback(
    (e) => {
      e.preventDefault();
      if (!newComment.trim() || !userInfo) return;

      socket.emit("comment:create", {
        id_product: id,
        id_user: userInfo.id_user,
        user_name: userInfo.fullname,
        content: newComment,
        role: userInfo.role,
      });

      setNewComment("");
    },
    [newComment, id, userInfo]
  );

  const handleSendReply = useCallback(
    (parentId, replyToName, e) => {
      e.preventDefault();
      if (!replyText[parentId]?.trim() || !userInfo) return;

      socket.emit("comment:reply", {
        id_product: id,
        id_user: userInfo.id_user,
        user_name: userInfo.fullname,
        content: replyText[parentId],
        id_parent_comment: parentId,
        reply_to_user: replyToName,
        role: userInfo.role,
      });

      setReplyText({ ...replyText, [parentId]: "" });
    },
    [replyText, id, userInfo]
  );

  return (
    <div className="my-[50px] bg-white shadow-xl border border-gray-100 p-10 rounded-xl max-h-[800px] overflow-y-scroll">
      <div className="text-[30px] font-extrabold">Hỏi người bán:</div>

      <div className="my-5">
        <form onSubmit={handleSendComment} className="w-full flex items-center gap-3">
          <Input
            placeholder="Nhập bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border border-gray-300"
          />
          <Button className="px-6 py-2 bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] text-white font-bold">
            Gửi
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        {commentList.length > 0 && commentList.map((cmt) => (
          <div key={cmt.id}>
            <div className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
              <img src={cmt.avatar} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{cmt.user}</span>
                  <span className="text-gray-400 text-xs">
                    {dateTimeFormat(cmt.time)}
                  </span>
                </div>

                <div className="mt-1 whitespace-pre-wrap break-words">{cmt.content}</div>

                <button
                  className="text-[10px] text-[var(--main-client-color)] mt-2 cursor-pointer hover:underline"
                  onClick={() =>
                    setReplyText({ ...replyText, [cmt.id]: replyText[cmt.id] || "" })
                  }
                >
                  Trả lời
                </button>

                {replyText[cmt.id] !== undefined && (
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e) => handleSendReply(cmt.id, cmt.user, e)}
                  >
                    <Input
                      placeholder="Viết phản hồi..."
                      value={replyText[cmt.id]}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [cmt.id]: e.target.value })
                      }
                    />
                    <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] text-white font-bold">
                      Gửi
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {cmt.replies.length > 0 && (
              <div className="ml-14 mt-3 space-y-3">
                {cmt.replies.map((rep) => (
                  <div key={rep.id} className="flex gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50">
                    <img src={rep.avatar} className="w-9 h-9 rounded-full" />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {rep.user}
                          {rep.replyTo && (
                            <span className="text-xs text-gray-500 ml-1">
                              → {rep.replyTo}
                            </span>
                          )}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {dateTimeFormat(rep.time)}
                        </span>
                      </div>

                      <div className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {rep.content}
                      </div>

                      <button
                        className="text-[10px] text-[var(--main-client-color)] mt-2 cursor-pointer hover:underline"
                        onClick={() =>
                          setReplyText({
                            ...replyText,
                            [cmt.id]: `@${rep.user} `
                          })
                        }
                      >
                        Trả lời
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}