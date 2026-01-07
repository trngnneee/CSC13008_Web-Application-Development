import db from "../config/database.config.js";
import { sendAuctionEndedNoWinnerMail, sendAuctionWonMail, sendAuctionSuccessMail } from "../helper/mail.helper.js";

/**
 * Process all auctions that have ended
 * Called by cron job every minute
 */
export const processEndedAuctions = async () => {
  try {
    // Find all active products whose end_date_time has passed
    const endedProducts = await db("product")
      .select(
        "product.*",
        "seller.email as seller_email",
        "seller.fullname as seller_name"
      )
      .leftJoin("user as seller", "product.updated_by", "seller.id_user")
      .where("product.status", "active")
      .whereNotNull("product.end_date_time")
      .where("product.end_date_time", "<=", new Date());

    if (endedProducts.length === 0) {
      return { processed: 0 };
    }

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
  } catch (error) {
    console.error("Error in processEndedAuctions:", error);
    throw error;
  }
};

/**
 * Process a single auction result
 */
const processAuctionResult = async (product) => {
  const { id_product, seller_email, seller_name, name: productName } = product;

  // Get all bids for this product, ordered by bid_price DESC, then time ASC (earlier wins tie)
  const bids = await db("bid")
    .select("bid.*", "user.email as bidder_email", "user.fullname as bidder_name")
    .leftJoin("user", "bid.id_user", "user.id_user")
    .where("bid.id_product", id_product)
    .orderBy("bid.bid_price", "desc")
    .orderBy("bid.time", "asc");

  if (bids.length === 0) {
    // No bids - auction ended with no winner
    await db("product")
      .where("id_product", id_product)
      .update({ status: "ended_no_winner" });

    // Send email to seller
    if (seller_email) {
      try {
        await sendAuctionEndedNoWinnerMail(seller_email, productName, seller_name);
      } catch (emailError) {
        console.error("Failed to send no-winner email:", emailError);
      }
    }

    console.log(`Auction ended with no winner for product: ${productName}`);
    return;
  }

  // Winner is the first bid (highest price, earliest time for ties)
  const winner = bids[0];

  // Update product status
  await db("product")
    .where("id_product", id_product)
    .update({ status: "ended_success" });

  // Check if winner_order already exists
  const existingOrder = await db("winner_order")
    .where("id_product", id_product)
    .first();

  if (!existingOrder) {
    // Create winner_order
    // Note: status column may need to be added to the table: ALTER TABLE winner_order ADD COLUMN status text DEFAULT 'pending_payment';
    // Note: created_at column may need to be added: ALTER TABLE winner_order ADD COLUMN created_at timestamp with time zone DEFAULT now();
    await db("winner_order").insert({
      id_product,
      id_user: winner.id_user,
      payment_bill: null,
      address: "Chưa cung cấp", // Required field - will be updated by winner
      b_l: null,
      status: "pending_payment", // pending_payment -> pending_shipping -> pending_delivery -> pending_rating -> completed / cancelled
    });
  }

  // Send email to seller
  if (seller_email) {
    try {
      await sendAuctionSuccessMail(
        seller_email,
        productName,
        seller_name,
        winner.bidder_name,
        winner.bid_price
      );
    } catch (emailError) {
      console.error("Failed to send success email to seller:", emailError);
    }
  }

  // Send email to winner
  if (winner.bidder_email) {
    try {
      await sendAuctionWonMail(
        winner.bidder_email,
        productName,
        winner.bidder_name,
        winner.bid_price
      );
    } catch (emailError) {
      console.error("Failed to send won email to winner:", emailError);
    }
  }

  console.log(`Auction ended successfully for product: ${productName}, winner: ${winner.bidder_name}`);
};

/**
 * Get winner order by product ID
 */
export const getWinnerOrderByProduct = async (id_product) => {
  const order = await db("winner_order")
    .select(
      "winner_order.*",
      "product.name as product_name",
      "product.avatar as product_avatar",
      "product.price as final_price",
      "product.updated_by as seller_id",
      "winner.fullname as winner_name",
      "winner.email as winner_email",
      "seller.fullname as seller_name",
      "seller.email as seller_email"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .leftJoin("user as winner", "winner_order.id_user", "winner.id_user")
    .leftJoin("user as seller", "product.updated_by", "seller.id_user")
    .where("winner_order.id_product", id_product)
    .first();

  return order;
};

/**
 * Get all winner orders for a user (as winner)
 */
export const getWinnerOrdersByUser = async (id_user) => {
  const orders = await db("winner_order")
    .select(
      "winner_order.*",
      "product.name as product_name",
      "product.avatar as product_avatar",
      "product.price as final_price",
      "seller.fullname as seller_name"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .leftJoin("user as seller", "product.updated_by", "seller.id_user")
    .where("winner_order.id_user", id_user)
    .orderBy("winner_order.created_at", "desc");

  return orders;
};

/**
 * Get all winner orders for a seller
 */
export const getWinnerOrdersBySeller = async (id_seller) => {
  const orders = await db("winner_order")
    .select(
      "winner_order.*",
      "product.name as product_name",
      "product.avatar as product_avatar",
      "product.price as final_price",
      "winner.fullname as winner_name",
      "winner.email as winner_email"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .leftJoin("user as winner", "winner_order.id_user", "winner.id_user")
    .where("product.updated_by", id_seller)
    .orderBy("winner_order.created_at", "desc");

  return orders;
};

/**
 * Get rating status for an order
 */
export const getRatingStatus = async (id_order, id_user) => {
  const order = await db("winner_order")
    .select(
      "winner_order.*",
      "product.updated_by as seller_id",
      "product.created_by as product_creator",
      "product.status as product_status"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  const sellerId = order.seller_id || order.product_creator;
  const isWinner = order.id_user === id_user;
  const isSeller = sellerId === id_user;

  if (!isWinner && !isSeller) {
    throw new Error("Bạn không có quyền xem thông tin đơn hàng này");
  }

  // Get all ratings for this product from rating table
  const ratings = await db("rating")
    .where("id_product", order.id_product);

  // Winner rated = winner is reviewer (rates seller)
  const hasWinnerRated = ratings.some(r => r.reviewer_id === order.id_user);
  // Seller rated = seller is reviewer (rates winner)
  const hasSellerRated = ratings.some(r => r.reviewer_id === sellerId);

  // Check if current user has rated (current user is reviewer)
  const myRating = ratings.find(r => r.reviewer_id === id_user);
  
  // Get the rating I received (I am reviewee)
  const ratingReceived = ratings.find(r => r.reviewee_id === id_user);

  // Determine if rating is allowed
  const allowedStatuses = ["pending_rating", "completed"];
  const canRate = !myRating && 
    order.product_status === "ended_success" && 
    allowedStatuses.includes(order.status);

  return {
    canRate,
    hasRated: !!myRating,
    myRating: myRating || null,
    ratingReceived: ratingReceived || null,
    hasWinnerRated,
    hasSellerRated,
    bothRated: hasWinnerRated && hasSellerRated,
    orderStatus: order.status,
    isWinner,
    isSeller,
  };
};
/**
 * Winner uploads payment bill and address
 */
export const submitPaymentInfo = async (id_order, id_user, payment_bill, address) => {
  const order = await db("winner_order")
    .where("id_order", id_order)
    .where("id_user", id_user)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.status !== "pending_payment") {
    throw new Error("Đơn hàng không ở trạng thái chờ thanh toán");
  }

  const [updated] = await db("winner_order")
    .where("id_order", id_order)
    .update({
      payment_bill,
      address,
      status: "pending_shipping",
    })
    .returning("*");

  return updated;
};

/**
 * Seller confirms payment and uploads shipping bill (B/L)
 */
export const confirmPaymentAndShip = async (id_order, id_seller, b_l) => {
  const order = await db("winner_order")
    .select("winner_order.*", "product.updated_by as seller_id")
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.seller_id !== id_seller) {
    throw new Error("Bạn không có quyền xác nhận đơn hàng này");
  }

  if (order.status !== "pending_shipping") {
    throw new Error("Đơn hàng không ở trạng thái chờ giao hàng");
  }

  const [updated] = await db("winner_order")
    .where("id_order", id_order)
    .update({
      b_l,
      status: "pending_delivery",
    })
    .returning("*");

  return updated;
};

/**
 * Winner confirms product received
 */
export const confirmReceived = async (id_order, id_user) => {
  const order = await db("winner_order")
    .where("id_order", id_order)
    .where("id_user", id_user)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.status !== "pending_delivery") {
    throw new Error("Đơn hàng không ở trạng thái đang giao");
  }

  const [updated] = await db("winner_order")
    .where("id_order", id_order)
    .update({
      status: "pending_rating",
    })
    .returning("*");

  return updated;
};

/**
 * Rate the other party (seller rates winner or winner rates seller)
 * Following the RATING FEATURE specification
 */
export const rateOrder = async (id_order, id_rater, score, comment) => {
  // Validate score
  if (score !== 1 && score !== -1) {
    throw new Error("Điểm đánh giá phải là +1 hoặc -1");
  }

  // Validate comment
  if (comment && comment.length > 500) {
    throw new Error("Bình luận không được vượt quá 500 ký tự");
  }

  const order = await db("winner_order")
    .select(
      "winner_order.*", 
      "product.updated_by as seller_id",
      "product.created_by as product_creator",
      "product.status as product_status"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Get seller id (updated_by or created_by)
  const sellerId = order.seller_id || order.product_creator;

  // Validate product status
  if (order.product_status !== "ended_success") {
    throw new Error("Chỉ có thể đánh giá khi đấu giá đã kết thúc thành công");
  }

  // Validate order status - must be at least pending_rating (delivery done)
  const allowedStatuses = ["pending_rating", "completed"];
  if (!allowedStatuses.includes(order.status)) {
    throw new Error("Chỉ có thể đánh giá sau khi đơn hàng đã được giao");
  }

  const isWinner = order.id_user === id_rater;
  const isSeller = sellerId === id_rater;

  if (!isWinner && !isSeller) {
    throw new Error("Bạn không có quyền đánh giá đơn hàng này");
  }

  // Determine who is being rated
  // Seller rates winner, Winner rates seller
  const id_to_user = isWinner ? sellerId : order.id_user;

  // Prevent self-rating
  if (id_rater === id_to_user) {
    throw new Error("Bạn không thể tự đánh giá chính mình");
  }

  // Use transaction
  return await db.transaction(async (trx) => {
    // Check if already rated (unique: id_product + reviewer_id + reviewee_id)
    const existingRating = await trx("rating")
      .where("reviewer_id", id_rater)
      .where("reviewee_id", id_to_user)
      .where("id_product", order.id_product)
      .first();

    if (existingRating) {
      throw new Error("Bạn đã đánh giá đơn hàng này rồi");
    }

    // Insert into rating table
    // Note: user_point is automatically updated by database trigger
    await trx("rating")
      .insert({
        id_product: order.id_product,
        reviewer_id: id_rater,
        reviewee_id: id_to_user,
        reviewer_role: isWinner ? "bidder" : "seller",
        content: comment || "",
        rating_point: score,
        created_at: new Date(),
      });

    const newRating = {
      id_product: order.id_product,
      reviewer_id: id_rater,
      reviewee_id: id_to_user,
      reviewer_role: isWinner ? "bidder" : "seller",
      content: comment || "",
      rating_point: score,
    };

    // Check if both parties have rated
    const ratings = await trx("rating")
      .where("id_product", order.id_product)
      .select("reviewer_id");

    // Winner rated = winner is reviewer
    const hasWinnerRated = ratings.some(r => r.reviewer_id === order.id_user);
    // Seller rated = seller is reviewer
    const hasSellerRated = ratings.some(r => r.reviewer_id === sellerId);

    if (hasWinnerRated && hasSellerRated) {
      // Both rated, mark order as completed
      await trx("winner_order")
        .where("id_order", id_order)
        .update({ status: "completed" });
    }

    return { 
      success: true, 
      rating: newRating,
      raterRole: isWinner ? "winner" : "seller" 
    };
  });
};

/**
 * Seller cancels the order (auto-rates winner with -1)
 */
export const cancelOrder = async (id_order, id_seller) => {
  const order = await db("winner_order")
    .select(
      "winner_order.*", 
      "product.updated_by as seller_id",
      "product.created_by as product_creator"
    )
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  const sellerId = order.seller_id || order.product_creator;

  if (sellerId !== id_seller) {
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error("Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy");
  }

  // Use transaction
  return await db.transaction(async (trx) => {
    // Cancel the order
    await trx("winner_order")
      .where("id_order", id_order)
      .update({ status: "cancelled" });

    // Auto-rate winner with -1 (as per spec)
    // Check if seller hasn't already rated this winner
    const existingRating = await trx("rating")
      .where("reviewer_id", id_seller)
      .where("reviewee_id", order.id_user)
      .where("id_product", order.id_product)
      .first();

    if (!existingRating) {
      // Create auto-rating from seller to winner in rating table
      // Note: user_point is automatically updated by database trigger
      await trx("rating").insert({
        id_product: order.id_product,
        reviewer_id: id_seller,
        reviewee_id: order.id_user,
        reviewer_role: "seller",
        content: "Người thắng đấu giá không hoàn thành thanh toán",
        rating_point: -1,
        created_at: new Date(),
      });
    }

    return { success: true };
  });
};
