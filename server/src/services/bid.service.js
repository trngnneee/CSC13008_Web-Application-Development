import db from '../config/database.js';
import {
  sendBidSuccessMail,
  sendNewBidNotificationMail,
  sendOutbidNotificationMail,
} from './mail.service.js';

// ─── Manual Bid ─────────────────────────────────────────────

export const placeBid = async (id_product, bid_price, id_user) => {
  const numericBidPrice = Number(bid_price);
  if (isNaN(numericBidPrice) || numericBidPrice <= 0) {
    throw new Error('Giá đấu giá phải là số dương hợp lệ');
  }

  const product = await db('product').where('id_product', id_product).first();
  if (!product) throw new Error('Sản phẩm không tồn tại');
  if (product.status !== 'active') throw new Error('Phiên đấu giá đã kết thúc hoặc không còn hoạt động');
  if (product.end_date_time && new Date() >= new Date(product.end_date_time)) {
    throw new Error('Phiên đấu giá đã kết thúc');
  }

  const sellerId = product.updated_by || product.created_by;
  if (sellerId === id_user) throw new Error('Bạn không thể đấu giá sản phẩm của chính mình');

  const kickRecord = await db('kick').where({ id_product, id_user }).first();
  if (kickRecord) throw new Error('Bạn đã bị kick khỏi phiên đấu giá này và không thể tham gia đấu giá');

  const bidder = await db('user')
    .select('user.*', 'user_point.judge_point', 'user_point.number_of_plus', 'user_point.number_of_minus')
    .leftJoin('user_point', 'user.id_user', 'user_point.id_user')
    .where('user.id_user', id_user)
    .first();
  if (!bidder) throw new Error('Người dùng không tồn tại');

  const plus = Number(bidder.number_of_plus || 0);
  const minus = Number(bidder.number_of_minus || 0);
  const total = plus + minus;
  const ratingPercent = total > 0 ? plus / total : 0;

  if (ratingPercent > 0 && ratingPercent < 0.8) {
    throw new Error(
      `Điểm đánh giá của bạn (${(ratingPercent * 100).toFixed(1)}%) chưa đủ điều kiện (yêu cầu ≥ 80%). Vui lòng cải thiện điểm đánh giá của bạn`
    );
  }

  // Rating = 0 → bid_request flow
  if (ratingPercent === 0) {
    const approvedRequest = await db('bid_request')
      .where({ id_bidder: id_user, id_product, id_seller: sellerId, status: 'approved' })
      .first();

    if (!approvedRequest) {
      const existingRequest = await db('bid_request')
        .where({ id_bidder: id_user, id_product, id_seller: sellerId, status: 'pending' })
        .first();
      if (existingRequest) {
        return { status: 'success', message: 'Yêu cầu duyệt từ bạn đang chờ xử lý. Vui lòng chờ người bán phê duyệt', data: existingRequest, requiresApproval: true };
      }

      const rejectedRequest = await db('bid_request')
        .where({ id_bidder: id_user, id_product, id_seller: sellerId, status: 'rejected' })
        .first();
      if (rejectedRequest) throw new Error('Yêu cầu đấu giá của bạn đã bị từ chối. Bạn không thể đấu giá sản phẩm này');

      const [bidRequest] = await db('bid_request')
        .insert({ id_bidder: id_user, id_product, id_seller: sellerId, bid_price: numericBidPrice, status: 'pending', created_at: new Date() })
        .returning('*');
      return { status: 'success', message: 'Yêu cầu của bạn đã được gửi tới người bán. Vui lòng chờ phê duyệt', data: bidRequest, requiresApproval: true };
    }
  }

  // Rating >= 80% → direct bid
  const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
  const pricingStep = Number(product.pricing_step || 0);
  const minBidPrice = currentPrice + pricingStep;
  const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;
  let isImmediatePurchase = false;
  let finalBidPrice = numericBidPrice;

  if (immediatePrice && numericBidPrice >= immediatePrice) {
    isImmediatePurchase = true;
    finalBidPrice = immediatePrice;
  } else if (numericBidPrice < minBidPrice) {
    throw new Error(`Giá đấu giá tối thiểu là ${parseInt(minBidPrice).toLocaleString('vi-VN')} VND (giá hiện tại + bước giá)`);
  }

  const result = await db.transaction(async (trx) => {
    const [newBid] = await trx('bid')
      .insert({ id_product, id_user, bid_price: finalBidPrice, time: new Date() })
      .returning('*');

    const updateData = { price: finalBidPrice };
    if (isImmediatePurchase) {
      updateData.status = 'ended_success';
      updateData.end_date_time = new Date();
      await trx('winner_order').insert({ id_product, id_user, address: 'Chưa cung cấp', status: 'pending_payment' });
    }

    await trx('product').where('id_product', id_product).update(updateData);
    return newBid;
  });

  // Send email notifications (non-blocking)
  sendBidNotificationEmails(id_product, id_user, product, finalBidPrice);

  if (!isImmediatePurchase) {
    setImmediate(async () => {
      try { await runAutoBidEngine(id_product); } catch (err) { console.error('Auto-bid engine error:', err); }
    });
  }

  return {
    status: 'success',
    message: isImmediatePurchase ? 'Mua ngay thành công! Bạn là người thắng đấu giá.' : 'Đấu giá thành công',
    data: result,
    isImmediatePurchase,
  };
};

// ─── Bid Requests ───────────────────────────────────────────

export const getBidRequests = async (id_seller) => {
  return db('bid_request')
    .select(
      'bid_request.*',
      'product.name as product_name',
      'product.avatar as product_avatar',
      'bidder.fullname as bidder_name',
      'bidder.email as bidder_email'
    )
    .leftJoin('product', 'bid_request.id_product', 'product.id_product')
    .leftJoin('user as bidder', 'bid_request.id_bidder', 'bidder.id_user')
    .where('bid_request.id_seller', id_seller)
    .andWhere('bid_request.status', 'pending')
    .orderBy('bid_request.created_at', 'desc');
};

export const getBidRequestsByProduct = async (id_product) => {
  return db('bid_request')
    .select('bid_request.*', 'bidder.fullname as bidder_name', 'bidder.email as bidder_email')
    .leftJoin('user as bidder', 'bid_request.id_bidder', 'bidder.id_user')
    .where('bid_request.id_product', id_product)
    .andWhere('bid_request.status', 'pending')
    .orderBy('bid_request.created_at', 'desc');
};

export const approveBidRequest = async (id_request, id_seller) => {
  const bidRequest = await db('bid_request').where('id', id_request).where('id_seller', id_seller).first();
  if (!bidRequest) throw new Error('Không tìm thấy yêu cầu đấu giá');
  if (bidRequest.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

  const product = await db('product').where('id_product', bidRequest.id_product).first();
  if (!product) throw new Error('Sản phẩm không còn tồn tại');

  if (product.status !== 'active' || (product.end_date_time && new Date() >= new Date(product.end_date_time))) {
    await db('bid_request').where('id', id_request).update({ status: 'rejected', updated_at: new Date() });
    throw new Error('Phiên đấu giá đã kết thúc, không thể phê duyệt yêu cầu này');
  }

  const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
  const pricingStep = Number(product.pricing_step || 0);
  const minBidPrice = currentPrice + pricingStep;
  const requestedPrice = Number(bidRequest.bid_price);
  const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;
  let isImmediatePurchase = false;
  let finalBidPrice = requestedPrice;

  if (immediatePrice && requestedPrice >= immediatePrice) {
    isImmediatePurchase = true;
    finalBidPrice = immediatePrice;
  } else if (requestedPrice < minBidPrice) {
    await db('bid_request').where('id', id_request).update({ status: 'rejected', updated_at: new Date() });
    throw new Error(`Giá đấu (${requestedPrice.toLocaleString('vi-VN')} VND) không còn hợp lệ. Giá tối thiểu hiện tại là ${minBidPrice.toLocaleString('vi-VN')} VND`);
  }

  const result = await db.transaction(async (trx) => {
    const [updated] = await trx('bid_request').where('id', id_request).update({ status: 'approved', updated_at: new Date() }).returning('*');
    const [newBid] = await trx('bid').insert({ id_user: bidRequest.id_bidder, id_product: bidRequest.id_product, bid_price: finalBidPrice, time: new Date() }).returning('*');

    const updateData = { price: finalBidPrice };
    if (isImmediatePurchase) {
      updateData.status = 'ended_success';
      updateData.end_date_time = new Date();
      await trx('winner_order').insert({ id_product: bidRequest.id_product, id_user: bidRequest.id_bidder, address: 'Chưa cung cấp', status: 'pending_payment' });
    }

    await trx('product').where('id_product', bidRequest.id_product).update(updateData);
    return { updated, newBid, isImmediatePurchase };
  });

  return result.updated;
};

export const rejectBidRequest = async (id_request, id_seller) => {
  const bidRequest = await db('bid_request').where('id', id_request).where('id_seller', id_seller).first();
  if (!bidRequest) throw new Error('Không tìm thấy yêu cầu đấu giá');
  if (bidRequest.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

  const [updated] = await db('bid_request').where('id', id_request).update({ status: 'rejected' }).returning('*');
  return updated;
};

// ─── Bidding Products ───────────────────────────────────────

export const getMyBiddingProducts = async (id_user) => {
  const now = new Date();
  const products = await db('bid')
    .select('product.id_product', 'product.name', 'product.avatar', 'product.starting_price', 'product.end_date_time', 'product.status')
    .leftJoin('product', 'bid.id_product', 'product.id_product')
    .where('bid.id_user', id_user)
    .where('product.status', 'active')
    .where('product.end_date_time', '>', now)
    .groupBy('product.id_product', 'product.name', 'product.avatar', 'product.starting_price', 'product.end_date_time', 'product.status')
    .orderBy('product.end_date_time', 'asc');

  return Promise.all(
    products.map(async (product) => {
      const bids = await db('bid')
        .select('bid.*', 'user.fullname as bidder_name')
        .leftJoin('user', 'bid.id_user', 'user.id_user')
        .where('bid.id_product', product.id_product)
        .orderBy('bid.bid_price', 'desc')
        .orderBy('bid.time', 'asc');

      const bid_count = bids.length;
      const current_price = bids.length > 0 ? bids[0].bid_price : product.starting_price;
      const highestBid = bids[0];
      const is_user_leading = highestBid?.id_user === id_user;

      const maskName = (name) => {
        if (!name) return '***';
        return name.split(' ').map((part) => (part.length <= 2 ? part[0] + '*' : part[0] + '*'.repeat(part.length - 2) + part[part.length - 1])).join(' ');
      };

      return {
        id_product: product.id_product,
        name: product.name,
        avatar: product.avatar,
        current_price: parseInt(current_price),
        bid_count,
        end_date_time: product.end_date_time,
        is_user_leading,
        current_highest_bidder: highestBid ? maskName(highestBid.bidder_name) : null,
      };
    })
  );
};

// ─── Bidder Management ──────────────────────────────────────

export const getBidderListByProduct = (id_product) => {
  return db('bid')
    .distinct(
      'bid.id_user',
      'user.fullname as bidder_name',
      'user.email as bidder_email',
      db.raw(`CASE WHEN kick.id_user IS NOT NULL THEN true ELSE false END as is_banned`)
    )
    .leftJoin('user', 'bid.id_user', 'user.id_user')
    .leftJoin('kick', function () {
      this.on('kick.id_user', '=', 'bid.id_user').andOn('kick.id_product', '=', db.raw('?', [id_product]));
    })
    .where('bid.id_product', id_product);
};

export const kickBidderFromProduct = (id_product, id_bidder) => {
  return db('kick').insert({ id_product, id_user: id_bidder, created_at: new Date() });
};

export const recoverBidderToProduct = (id_product, id_bidder) => {
  return db('kick').where('id_product', id_product).where('id_user', id_bidder).del();
};

// ─── Auto Bid ───────────────────────────────────────────────

export const placeAutoBid = async (id_product, max_bid, id_user) => {
  const numericMaxBid = Number(max_bid);
  if (isNaN(numericMaxBid) || numericMaxBid <= 0) throw new Error('Giá đấu giá tự động phải là số dương hợp lệ');

  const product = await db('product').where('id_product', id_product).first();
  if (!product) throw new Error('Sản phẩm không tồn tại');
  if (product.status !== 'active') throw new Error('Phiên đấu giá đã kết thúc hoặc không còn hoạt động');
  if (product.end_date_time && new Date() >= new Date(product.end_date_time)) throw new Error('Phiên đấu giá đã kết thúc');

  const sellerId = product.updated_by || product.created_by;
  if (sellerId === id_user) throw new Error('Bạn không thể đấu giá sản phẩm của chính mình');

  const kickRecord = await db('kick').where({ id_product, id_user }).first();
  if (kickRecord) throw new Error('Bạn đã bị kick khỏi phiên đấu giá này');

  const bidder = await db('user')
    .select('user.*', 'user_point.number_of_plus', 'user_point.number_of_minus')
    .leftJoin('user_point', 'user.id_user', 'user_point.id_user')
    .where('user.id_user', id_user)
    .first();
  if (!bidder) throw new Error('Người dùng không tồn tại');

  const plus = Number(bidder.number_of_plus || 0);
  const minus = Number(bidder.number_of_minus || 0);
  const total = plus + minus;
  const ratingPercent = total > 0 ? plus / total : 0;

  if (total > 0 && ratingPercent < 0.8) {
    throw new Error(`Điểm đánh giá của bạn (${(ratingPercent * 100).toFixed(1)}%) chưa đủ điều kiện (yêu cầu ≥ 80%)`);
  }

  if (ratingPercent === 0) {
    const approvedRequest = await db('bid_request').where({ id_bidder: id_user, id_product, id_seller: sellerId, status: 'approved' }).first();
    if (!approvedRequest) throw new Error('Bạn cần được seller phê duyệt trước khi đặt auto-bid');
  }

  const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
  const pricingStep = Number(product.pricing_step || 0);
  const minMaxBid = currentPrice + pricingStep;

  if (numericMaxBid < minMaxBid) {
    throw new Error(`Giá auto-bid tối thiểu phải là ${parseInt(minMaxBid).toLocaleString('vi-VN')} VND`);
  }

  const existingAutoBid = await db('auto_bid').where({ id_product, id_user }).first();
  let autoBidResult;

  if (existingAutoBid) {
    [autoBidResult] = await db('auto_bid').where('id_bid', existingAutoBid.id_bid).update({ max_bid: numericMaxBid }).returning('*');
  } else {
    [autoBidResult] = await db('auto_bid').insert({ id_product, id_user, max_bid: numericMaxBid }).returning('*');
  }

  await runAutoBidEngine(id_product);

  return {
    status: 'success',
    message: existingAutoBid ? 'Cập nhật auto-bid thành công' : 'Đặt auto-bid thành công',
    data: autoBidResult,
  };
};

export const getAutoBid = async (id_product, id_user) => {
  return (await db('auto_bid').where({ id_product, id_user }).first()) || null;
};

export const deleteAutoBid = async (id_product, id_user) => {
  const deleted = await db('auto_bid').where({ id_product, id_user }).del();
  if (!deleted) throw new Error('Không tìm thấy auto-bid để xóa');
  return { status: 'success', message: 'Đã xóa auto-bid' };
};

// ─── Auto-Bid Engine ────────────────────────────────────────

export const runAutoBidEngine = async (id_product) => {
  return db.transaction(async (trx) => {
    const product = await trx('product').where('id_product', id_product).where('status', 'active').forUpdate().first();
    if (!product) return null;
    if (product.end_date_time && new Date() >= new Date(product.end_date_time)) return null;

    const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
    const pricingStep = Number(product.pricing_step || 0);
    const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;

    const autoBids = await trx('auto_bid')
      .select('auto_bid.*', 'user.fullname', 'user.email')
      .leftJoin('user', 'auto_bid.id_user', 'user.id_user')
      .leftJoin('kick', function () {
        this.on('kick.id_user', '=', 'auto_bid.id_user').andOn('kick.id_product', '=', 'auto_bid.id_product');
      })
      .where('auto_bid.id_product', id_product)
      .whereNull('kick.id_user')
      .orderBy('auto_bid.max_bid', 'desc');

    if (autoBids.length === 0) return null;

    let newPrice;
    const winner = autoBids[0];

    if (autoBids.length === 1) {
      newPrice = Math.min(Number(winner.max_bid), currentPrice + pricingStep);
    } else {
      const runnerUp = autoBids[1];
      newPrice = Math.min(Number(winner.max_bid), Number(runnerUp.max_bid) + pricingStep);
    }

    if (newPrice <= currentPrice) return null;

    let isImmediatePurchase = false;
    if (immediatePrice && newPrice >= immediatePrice) {
      newPrice = immediatePrice;
      isImmediatePurchase = true;
    }

    const [newBid] = await trx('bid')
      .insert({ id_product, id_user: winner.id_user, bid_price: newPrice, time: new Date(), is_auto_bid: true })
      .returning('*');

    const updateData = { price: newPrice };
    if (isImmediatePurchase) {
      updateData.status = 'ended_success';
      updateData.end_date_time = new Date();
      await trx('winner_order').insert({ id_product, id_user: winner.id_user, address: 'Chưa cung cấp', status: 'pending_payment' });
    }

    await trx('product').where('id_product', id_product).update(updateData);

    if (!isImmediatePurchase) {
      await extendAuctionTimeIfNeeded(trx, id_product);
    }

    // Non-blocking email notifications
    setImmediate(async () => {
      try {
        const productUrl = `${process.env.FRONTEND_URL}/product/${id_product}`;
        if (winner.email) await sendBidSuccessMail(winner.email, winner.fullname, product.name, newPrice, productUrl);

        const seller = await db('user').where('id_user', product.updated_by || product.created_by).first();
        if (seller?.email) await sendNewBidNotificationMail(seller.email, seller.fullname, product.name, winner.fullname, newPrice, productUrl);

        for (let i = 1; i < autoBids.length; i++) {
          if (autoBids[i].email) await sendOutbidNotificationMail(autoBids[i].email, autoBids[i].fullname, product.name, newPrice, productUrl);
        }
      } catch (err) {
        console.error('Failed to send auto-bid emails:', err);
      }
    });

    return { newBid, winner: winner.id_user, newPrice, isImmediatePurchase };
  });
};

// ─── Helpers ────────────────────────────────────────────────

const extendAuctionTimeIfNeeded = async (trx, id_product) => {
  const settings = await trx('auction_settings').first();
  if (!settings?.extend_threshold_minutes || !settings?.extend_duration_minutes) return false;

  const product = await trx('product').where('id_product', id_product).first();
  if (!product?.end_date_time) return false;

  const now = new Date();
  const endTime = new Date(product.end_date_time);
  const thresholdMs = settings.extend_threshold_minutes * 60 * 1000;
  const remainingMs = endTime.getTime() - now.getTime();

  if (remainingMs <= thresholdMs && remainingMs > 0) {
    const extensionMs = settings.extend_duration_minutes * 60 * 1000;
    const newEndTime = new Date(endTime.getTime() + extensionMs);
    await trx('product').where('id_product', id_product).update({ end_date_time: newEndTime });
    return true;
  }
  return false;
};

const sendBidNotificationEmails = async (id_product, id_user, product, finalBidPrice) => {
  try {
    const productUrl = `${process.env.FRONTEND_URL}/product/${id_product}`;
    const bidder = await db('user').where('id_user', id_user).first();
    const seller = await db('user').where('id_user', product.updated_by || product.created_by).first();

    if (bidder?.email) await sendBidSuccessMail(bidder.email, bidder.fullname, product.name, finalBidPrice, productUrl);
    if (seller?.email) await sendNewBidNotificationMail(seller.email, seller.fullname, product.name, bidder?.fullname || 'Người đấu giá', finalBidPrice, productUrl);

    const previousBidders = await db('bid')
      .select('user.id_user', 'user.email', 'user.fullname')
      .leftJoin('user', 'bid.id_user', 'user.id_user')
      .where('bid.id_product', id_product)
      .whereNot('bid.id_user', id_user)
      .groupBy('user.id_user', 'user.email', 'user.fullname');

    for (const prev of previousBidders) {
      if (prev.email) await sendOutbidNotificationMail(prev.email, prev.fullname, product.name, finalBidPrice, productUrl);
    }
  } catch (err) {
    console.error('Failed to send bid notification emails:', err);
  }
};
