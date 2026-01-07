import db from "../../config/database.config.js"
import { sendNewCommentNotificationMail } from "../../helper/mail.helper.js";
import { findRootCommentId, getFullThread } from "../../helper/comment.helper.js";

export const commentRootCreatePost = async (req, res) => {
  const result = await db('comments').insert({
    id_product: req.body.id_product,
    id_user: req.account.id_user,
    user_name: req.account.fullname,
    content: req.body.content,
    created_at: new Date(),
    id_parent_comment: null,
    reply_to_user: null
  }).returning('*');

  if (req.account.role != "seller") {
    const data = await db('product')
      .join('user', 'product.created_by', 'user.id_user')
      .select('user.email', 'product.name')
      .where('product.id_product', req.body.id_product)
      .first();
    sendNewCommentNotificationMail(data.email, data.name, req.account.fullname, req.body.content, `${process.env.FRONTEND_URL}/product/${req.body.id_product}`);
  }

  res.json({
    code: "success",
    message: "Bình luận gốc được tạo thành công",
    comment: result[0]
  })
}

export const commentListGetByProductId = async (req, res) => {
  const commentList = await db('comments')
    .where({ id_product: req.params.id_product })
    .orderBy('created_at', 'desc');

  res.json({
    code: "success",
    message: "Danh sách bình luận theo sản phẩm",
    commentList: commentList
  })
}

export const commentReplyCreatePost = async (req, res) => {
  const result = await db('comments').insert({
    id_product: req.body.id_product,
    id_user: req.account.id_user,
    user_name: req.account.fullname,
    content: req.body.content,
    created_at: new Date(),
    id_parent_comment: req.body.id_parent_comment,
    reply_to_user: req.body.reply_to_user
  }).returning('*');

  const rootID = await findRootCommentId(result[0].id_comment);
  const fullThread = await getFullThread(rootID);

  const userIDs = req.account.role == "seller" ? [...new Set(fullThread.map(c => c.id_user).filter(id => id !== req.account.id_user))] : [...new Set(fullThread.map(c => c.id_user))];
  const participants = await db('user').whereIn('id_user', userIDs).whereIn('role', ['admin', 'bidder']);

  if (req.account.role == "seller") {
    const productData = await db('product')
      .select('name')
      .where('id_product', req.body.id_product)
      .first();
      
    if (productData && productData.created_by === req.account.id_user) {
      for (const participant of participants) {
        sendNewCommentNotificationMail(
          participant.email,
          productData.name,
          req.account.fullname,
          req.body.content,
          `${process.env.FRONTEND_URL}/product/${req.body.id_product}`
        );
      }
    }
  }

  res.json({
    code: "success",
    message: "Đã gửi phản hồi!",
    comment: result[0]
  })
}