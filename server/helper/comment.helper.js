import db from "../config/database.config.js"

export const findRootCommentId = async (commentId) => {
  let current = await db("comments")
    .where("id_comment", commentId)
    .first();

  if (!current) return null;

  while (current.id_parent_comment !== null) {
    current = await db("comments")
      .where("id_comment", current.id_parent_comment)
      .first();
  }

  return current.id_comment;
}

export const getFullThread = async (rootId) => {
  let all = [];
  let queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift();

    const comment = await db("comments")
      .where("id_comment", current)
      .first();

    if (comment) {
      all.push(comment);
    }

    const children = await db("comments")
      .where("id_parent_comment", current);

    for (const child of children) {
      queue.push(child.id_comment);
    }
  }

  return all;
}
