import { COMMENT_EVENTS } from '../constants/socketEvents.js';
import * as commentService from '../services/comment.service.js';

/**
 * Register comment-related socket events.
 * Each product has its own room: `product:<id_product>`
 */
export default function registerCommentHandlers(io, socket) {
  // Join a product's comment room
  socket.on(COMMENT_EVENTS.JOIN, ({ id_product }) => {
    if (!id_product) return;
    const room = `product:${id_product}`;
    socket.join(room);
  });

  // Leave a product's comment room
  socket.on(COMMENT_EVENTS.LEAVE, ({ id_product }) => {
    if (!id_product) return;
    const room = `product:${id_product}`;
    socket.leave(room);
  });

  // Create a root comment
  socket.on(COMMENT_EVENTS.CREATE, async (data) => {
    try {
      const { id_product, id_user, user_name, content, role } = data;
      if (!id_product || !id_user || !content) {
        return socket.emit(COMMENT_EVENTS.ERROR, { message: 'Thiếu thông tin bình luận' });
      }

      const comment = await commentService.createRootComment({
        id_product,
        id_user,
        user_name,
        content,
        role,
      });

      // Broadcast to everyone in the room (including sender)
      io.to(`product:${id_product}`).emit(COMMENT_EVENTS.NEW, comment);
    } catch (error) {
      socket.emit(COMMENT_EVENTS.ERROR, { message: error.message });
    }
  });

  // Reply to a comment
  socket.on(COMMENT_EVENTS.REPLY, async (data) => {
    try {
      const { id_product, id_user, user_name, content, id_parent_comment, reply_to_user, role } = data;
      if (!id_product || !id_user || !content || !id_parent_comment) {
        return socket.emit(COMMENT_EVENTS.ERROR, { message: 'Thiếu thông tin phản hồi' });
      }

      const comment = await commentService.createReplyComment({
        id_product,
        id_user,
        user_name,
        content,
        id_parent_comment,
        reply_to_user,
        role,
      });

      io.to(`product:${id_product}`).emit(COMMENT_EVENTS.NEW, comment);
    } catch (error) {
      socket.emit(COMMENT_EVENTS.ERROR, { message: error.message });
    }
  });

  // Fetch all comments for a product
  socket.on(COMMENT_EVENTS.LIST, async ({ id_product }) => {
    try {
      if (!id_product) {
        return socket.emit(COMMENT_EVENTS.ERROR, { message: 'Thiếu id_product' });
      }

      const comments = await commentService.getCommentsByProduct(id_product);
      socket.emit(COMMENT_EVENTS.LIST, comments);
    } catch (error) {
      socket.emit(COMMENT_EVENTS.ERROR, { message: error.message });
    }
  });
}
