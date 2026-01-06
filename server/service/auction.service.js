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
 */
export const rateOrder = async (id_order, id_rater, rating, comment) => {
  const order = await db("winner_order")
    .select("winner_order.*", "product.updated_by as seller_id")
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  const isWinner = order.id_user === id_rater;
  const isSeller = order.seller_id === id_rater;

  if (!isWinner && !isSeller) {
    throw new Error("Bạn không có quyền đánh giá đơn hàng này");
  }

  // Determine who is being rated
  const id_rated = isWinner ? order.seller_id : order.id_user;
  const raterRole = isWinner ? "winner" : "seller";

  // Check if already rated
  const existingRating = await db("service_judge")
    .where("id_product", order.id_product)
    .where("id_user", id_rater)
    .first();

  if (existingRating) {
    throw new Error("Bạn đã đánh giá đơn hàng này rồi");
  }

  // Insert rating
  await db("service_judge").insert({
    id_product: order.id_product,
    id_user: id_rater,
    content: comment || "",
    rating_point: rating, // +1 or -1
  });

  // Update user_point for the rated user
  const userPoint = await db("user_point")
    .where("id_user", id_rated)
    .first();

  if (userPoint) {
    const updateData = {};
    if (rating > 0) {
      updateData.number_of_plus = (userPoint.number_of_plus || 0) + 1;
    } else {
      updateData.number_of_minus = (userPoint.number_of_minus || 0) + 1;
    }
    
    // Recalculate judge_point
    const totalPlus = (updateData.number_of_plus ?? userPoint.number_of_plus) || 0;
    const totalMinus = (updateData.number_of_minus ?? userPoint.number_of_minus) || 0;
    const total = totalPlus + totalMinus;
    updateData.judge_point = total > 0 ? totalPlus / total : 0;

    await db("user_point")
      .where("id_user", id_rated)
      .update(updateData);
  } else {
    // Create user_point if not exists
    await db("user_point").insert({
      id_user: id_rated,
      judge_point: rating > 0 ? 1 : 0,
      number_of_plus: rating > 0 ? 1 : 0,
      number_of_minus: rating < 0 ? 1 : 0,
    });
  }

  // Check if both parties have rated
  const ratings = await db("service_judge")
    .where("id_product", order.id_product)
    .select("id_user");

  const hasWinnerRated = ratings.some(r => r.id_user === order.id_user);
  const hasSellerRated = ratings.some(r => r.id_user === order.seller_id);

  if (hasWinnerRated && hasSellerRated) {
    // Both rated, mark order as completed
    await db("winner_order")
      .where("id_order", id_order)
      .update({ status: "completed" });
  }

  return { success: true, raterRole };
};

/**
 * Seller cancels the order
 */
export const cancelOrder = async (id_order, id_seller) => {
  const order = await db("winner_order")
    .select("winner_order.*", "product.updated_by as seller_id")
    .leftJoin("product", "winner_order.id_product", "product.id_product")
    .where("winner_order.id_order", id_order)
    .first();

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.seller_id !== id_seller) {
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error("Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy");
  }

  // Cancel the order
  await db("winner_order")
    .where("id_order", id_order)
    .update({ status: "cancelled" });

  // Give winner -1 rating (as per spec)
  const winnerPoint = await db("user_point")
    .where("id_user", order.id_user)
    .first();

  if (winnerPoint) {
    const newMinus = (winnerPoint.number_of_minus || 0) + 1;
    const totalPlus = winnerPoint.number_of_plus || 0;
    const total = totalPlus + newMinus;
    const newJudgePoint = total > 0 ? totalPlus / total : 0;

    await db("user_point")
      .where("id_user", order.id_user)
      .update({
        number_of_minus: newMinus,
        judge_point: newJudgePoint,
      });
  } else {
    await db("user_point").insert({
      id_user: order.id_user,
      judge_point: 0,
      number_of_plus: 0,
      number_of_minus: 1,
    });
  }

  return { success: true };
};
