export const commentTreeFormat = (commentList) => {
  const map = {};
  commentList.forEach(c => {
    map[c.id_comment] = {
      id: c.id_comment,
      user: c.user_name,
      avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.user_name),
      time: new Date(c.created_at).toISOString(),
      content: c.content,
      replyTo: c.reply_to_user,
      replies: []
    };
  });

  const rootComments = [];

  commentList.forEach(c => {
    if (c.id_parent_comment) {
      map[c.id_parent_comment].replies.push(map[c.id_comment]);
    } else {
      rootComments.push(map[c.id_comment]);
    }
  });

  return rootComments;
}