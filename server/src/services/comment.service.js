import db from '../config/database.js';
import { findRootCommentId, getFullThread } from '../utils/comment.js';
import { sendNewCommentNotificationMail } from './mail.service.js';

export const createRootComment = async ({ id_product, id_user, user_name, content, role }) => {
  const [comment] = await db('comments')
    .insert({
      id_product,
      id_user,
      user_name,
      content,
      created_at: new Date(),
      id_parent_comment: null,
      reply_to_user: null,
    })
    .returning('*');

  // Notify seller if commenter is not the seller
  if (role !== 'seller') {
    try {
      const data = await db('product')
        .join('user', 'product.created_by', 'user.id_user')
        .select('user.email', 'product.name')
        .where('product.id_product', id_product)
        .first();

      if (data?.email) {
        await sendNewCommentNotificationMail(
          data.email,
          data.name,
          user_name,
          content,
          `${process.env.FRONTEND_URL}/product/${id_product}`
        );
      }
    } catch (err) {
      console.error('Failed to send comment notification:', err);
    }
  }

  return comment;
};

export const createReplyComment = async ({ id_product, id_user, user_name, content, id_parent_comment, reply_to_user, role }) => {
  const [comment] = await db('comments')
    .insert({
      id_product,
      id_user,
      user_name,
      content,
      created_at: new Date(),
      id_parent_comment,
      reply_to_user,
    })
    .returning('*');

  // Notify thread participants
  try {
    const rootID = await findRootCommentId(comment.id_comment);
    const fullThread = await getFullThread(rootID);

    const userIDs =
      role === 'seller'
        ? [...new Set(fullThread.map((c) => c.id_user).filter((id) => id !== id_user))]
        : [...new Set(fullThread.map((c) => c.id_user))];

    const participants = await db('user').whereIn('id_user', userIDs).whereIn('role', ['admin', 'bidder']);

    if (role === 'seller') {
      const productData = await db('product').select('name', 'created_by').where('id_product', id_product).first();
      if (productData && productData.created_by === id_user) {
        for (const participant of participants) {
          await sendNewCommentNotificationMail(
            participant.email,
            productData.name,
            user_name,
            content,
            `${process.env.FRONTEND_URL}/product/${id_product}`
          );
        }
      }
    }
  } catch (err) {
    console.error('Failed to send reply notification:', err);
  }

  return comment;
};

export const getCommentsByProduct = async (id_product) => {
  return db('comments').where({ id_product }).orderBy('created_at', 'desc');
};
