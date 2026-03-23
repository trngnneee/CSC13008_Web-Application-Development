import db from '../config/database.js';
import {
  sendAuctionEndedNoWinnerMail,
  sendAuctionWonMail,
  sendAuctionSuccessMail,
} from './mail.service.js';

// ─── Process Ended Auctions ────────────────────────────────

export const processEndedAuctions = async () => {
  const endedProducts = await db('product')
    .select('product.*', 'seller.email as seller_email', 'seller.fullname as seller_name')
    .leftJoin('user as seller', 'product.updated_by', 'seller.id_user')
    .where('product.status', 'active')
    .whereNotNull('product.end_date_time')
    .where('product.end_date_time', '<=', new Date());

  if (endedProducts.length === 0) return { processed: 0 };

  let processedCount = 0;
  for (const product of endedProducts) {
    try {
      await processAuctionResult(product);
      processedCount++;
    } catch (error) {
      console.error(`Error processing auction for product ${product.id_product}:`, error);
    }
  }
  return { processed: processedCount };
};

const processAuctionResult = async (product) => {
  const { id_product, seller_email, seller_name, name: productName } = product;

  const bids = await db('bid')
    .select('bid.*', 'user.email as bidder_email', 'user.fullname as bidder_name')
    .leftJoin('user', 'bid.id_user', 'user.id_user')
    .where('bid.id_product', id_product)
    .orderBy('bid.bid_price', 'desc')
    .orderBy('bid.time', 'asc');

  if (bids.length === 0) {
    await db('product').where('id_product', id_product).update({ status: 'ended_no_winner' });
    if (seller_email) {
      try { await sendAuctionEndedNoWinnerMail(seller_email, productName, seller_name); } catch (err) { console.error('Failed to send no-winner email:', err); }
    }
    return;
  }

  const winner = bids[0];
  await db('product').where('id_product', id_product).update({ status: 'ended_success' });

  const existingOrder = await db('winner_order').where('id_product', id_product).first();
  if (!existingOrder) {
    await db('winner_order').insert({
      id_product,
      id_user: winner.id_user,
      payment_bill: null,
      address: 'Chưa cung cấp',
      b_l: null,
      status: 'pending_payment',
    });
  }

  if (seller_email) {
    try { await sendAuctionSuccessMail(seller_email, productName, seller_name, winner.bidder_name, winner.bid_price); } catch (err) { console.error('Failed to send success email:', err); }
  }
  if (winner.bidder_email) {
    try { await sendAuctionWonMail(winner.bidder_email, productName, winner.bidder_name, winner.bid_price); } catch (err) { console.error('Failed to send won email:', err); }
  }
};

// ─── Winner Orders ──────────────────────────────────────────

export const getWinnerOrderByProduct = async (id_product) => {
  return db('winner_order')
    .select(
      'winner_order.*',
      'product.name as product_name', 'product.avatar as product_avatar', 'product.price as final_price', 'product.updated_by as seller_id',
      'winner.fullname as winner_name', 'winner.email as winner_email',
      'seller.fullname as seller_name', 'seller.email as seller_email'
    )
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .leftJoin('user as winner', 'winner_order.id_user', 'winner.id_user')
    .leftJoin('user as seller', 'product.updated_by', 'seller.id_user')
    .where('winner_order.id_product', id_product)
    .first();
};

export const getWinnerOrdersByUser = async (id_user) => {
  return db('winner_order')
    .select('winner_order.*', 'product.name as product_name', 'product.avatar as product_avatar', 'product.price as final_price', 'seller.fullname as seller_name')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .leftJoin('user as seller', 'product.updated_by', 'seller.id_user')
    .where('winner_order.id_user', id_user)
    .orderBy('winner_order.created_at', 'desc');
};

export const getWinnerOrdersBySeller = async (id_seller) => {
  return db('winner_order')
    .select('winner_order.*', 'product.name as product_name', 'product.avatar as product_avatar', 'product.price as final_price', 'winner.fullname as winner_name', 'winner.email as winner_email')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .leftJoin('user as winner', 'winner_order.id_user', 'winner.id_user')
    .where('product.updated_by', id_seller)
    .orderBy('winner_order.created_at', 'desc');
};

// ─── Order Operations ───────────────────────────────────────

export const submitPaymentInfo = async (id_order, id_user, payment_bill, address) => {
  const order = await db('winner_order').where('id_order', id_order).where('id_user', id_user).first();
  if (!order) throw new Error('Không tìm thấy đơn hàng');
  if (order.status !== 'pending_payment') throw new Error('Đơn hàng không ở trạng thái chờ thanh toán');

  const [updated] = await db('winner_order').where('id_order', id_order).update({ payment_bill, address, status: 'pending_shipping' }).returning('*');
  return updated;
};

export const confirmPaymentAndShip = async (id_order, id_seller, b_l) => {
  const order = await db('winner_order')
    .select('winner_order.*', 'product.updated_by as seller_id')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .where('winner_order.id_order', id_order)
    .first();

  if (!order) throw new Error('Không tìm thấy đơn hàng');
  if (order.seller_id !== id_seller) throw new Error('Bạn không có quyền xác nhận đơn hàng này');
  if (order.status !== 'pending_shipping') throw new Error('Đơn hàng không ở trạng thái chờ giao hàng');

  const [updated] = await db('winner_order').where('id_order', id_order).update({ b_l, status: 'pending_delivery' }).returning('*');
  return updated;
};

export const confirmReceived = async (id_order, id_user) => {
  const order = await db('winner_order').where('id_order', id_order).where('id_user', id_user).first();
  if (!order) throw new Error('Không tìm thấy đơn hàng');
  if (order.status !== 'pending_delivery') throw new Error('Đơn hàng không ở trạng thái đang giao');

  const [updated] = await db('winner_order').where('id_order', id_order).update({ status: 'pending_rating' }).returning('*');
  return updated;
};

// ─── Rating ─────────────────────────────────────────────────

export const getRatingStatus = async (id_order, id_user) => {
  const order = await db('winner_order')
    .select('winner_order.*', 'product.updated_by as seller_id', 'product.created_by as product_creator', 'product.status as product_status')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .where('winner_order.id_order', id_order)
    .first();

  if (!order) throw new Error('Không tìm thấy đơn hàng');

  const sellerId = order.seller_id || order.product_creator;
  const isWinner = order.id_user === id_user;
  const isSeller = sellerId === id_user;

  if (!isWinner && !isSeller) throw new Error('Bạn không có quyền xem thông tin đơn hàng này');

  const ratings = await db('rating').where('id_product', order.id_product);
  const hasWinnerRated = ratings.some((r) => r.reviewer_id === order.id_user);
  const hasSellerRated = ratings.some((r) => r.reviewer_id === sellerId);
  const myRating = ratings.find((r) => r.reviewer_id === id_user);
  const ratingReceived = ratings.find((r) => r.reviewee_id === id_user);

  const allowedStatuses = ['pending_rating', 'completed'];
  const canRate = !myRating && order.product_status === 'ended_success' && allowedStatuses.includes(order.status);

  return { canRate, hasRated: !!myRating, myRating: myRating || null, ratingReceived: ratingReceived || null, hasWinnerRated, hasSellerRated, bothRated: hasWinnerRated && hasSellerRated, orderStatus: order.status, isWinner, isSeller };
};

export const rateOrder = async (id_order, id_rater, score, comment) => {
  if (score !== 1 && score !== -1) throw new Error('Điểm đánh giá phải là +1 hoặc -1');
  if (comment && comment.length > 500) throw new Error('Bình luận không được vượt quá 500 ký tự');

  const order = await db('winner_order')
    .select('winner_order.*', 'product.updated_by as seller_id', 'product.created_by as product_creator', 'product.status as product_status')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .where('winner_order.id_order', id_order)
    .first();

  if (!order) throw new Error('Không tìm thấy đơn hàng');

  const sellerId = order.seller_id || order.product_creator;
  if (order.product_status !== 'ended_success') throw new Error('Chỉ có thể đánh giá khi đấu giá đã kết thúc thành công');

  const allowedStatuses = ['pending_rating', 'completed'];
  if (!allowedStatuses.includes(order.status)) throw new Error('Chỉ có thể đánh giá sau khi đơn hàng đã được giao');

  const isWinner = order.id_user === id_rater;
  const isSeller = sellerId === id_rater;
  if (!isWinner && !isSeller) throw new Error('Bạn không có quyền đánh giá đơn hàng này');

  const id_to_user = isWinner ? sellerId : order.id_user;
  if (id_rater === id_to_user) throw new Error('Bạn không thể tự đánh giá chính mình');

  return db.transaction(async (trx) => {
    const existingRating = await trx('rating').where({ reviewer_id: id_rater, reviewee_id: id_to_user, id_product: order.id_product }).first();
    if (existingRating) throw new Error('Bạn đã đánh giá đơn hàng này rồi');

    await trx('rating').insert({
      id_product: order.id_product,
      reviewer_id: id_rater,
      reviewee_id: id_to_user,
      reviewer_role: isWinner ? 'bidder' : 'seller',
      content: comment || '',
      rating_point: score,
      created_at: new Date(),
    });

    const newRating = { id_product: order.id_product, reviewer_id: id_rater, reviewee_id: id_to_user, reviewer_role: isWinner ? 'bidder' : 'seller', content: comment || '', rating_point: score };

    const ratings = await trx('rating').where('id_product', order.id_product).select('reviewer_id');
    const hasWinnerRated = ratings.some((r) => r.reviewer_id === order.id_user);
    const hasSellerRated = ratings.some((r) => r.reviewer_id === sellerId);

    if (hasWinnerRated && hasSellerRated) {
      await trx('winner_order').where('id_order', id_order).update({ status: 'completed' });
    }

    return { success: true, rating: newRating, raterRole: isWinner ? 'winner' : 'seller' };
  });
};

export const cancelOrder = async (id_order, id_seller) => {
  const order = await db('winner_order')
    .select('winner_order.*', 'product.updated_by as seller_id', 'product.created_by as product_creator')
    .leftJoin('product', 'winner_order.id_product', 'product.id_product')
    .where('winner_order.id_order', id_order)
    .first();

  if (!order) throw new Error('Không tìm thấy đơn hàng');
  const sellerId = order.seller_id || order.product_creator;
  if (sellerId !== id_seller) throw new Error('Bạn không có quyền hủy đơn hàng này');
  if (order.status === 'completed' || order.status === 'cancelled') throw new Error('Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy');

  return db.transaction(async (trx) => {
    await trx('winner_order').where('id_order', id_order).update({ status: 'cancelled' });

    const existingRating = await trx('rating').where({ reviewer_id: id_seller, reviewee_id: order.id_user, id_product: order.id_product }).first();
    if (!existingRating) {
      await trx('rating').insert({
        id_product: order.id_product,
        reviewer_id: id_seller,
        reviewee_id: order.id_user,
        reviewer_role: 'seller',
        content: 'Người thắng đấu giá không hoàn thành thanh toán',
        rating_point: -1,
        created_at: new Date(),
      });
    }

    return { success: true };
  });
};
