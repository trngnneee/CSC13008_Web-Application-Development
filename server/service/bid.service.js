import db from "../config/database.config.js";
import { sendBidSuccessMail, sendNewBidNotificationMail, sendOutbidNotificationMail } from "../helper/mail.helper.js";

export const placeBid = async (id_product, bid_price, id_user) => {
  try {
    console.log("=== BID SERVICE START ===");
    console.log("Params - id_product:", id_product, "bid_price:", bid_price, "id_user:", id_user);

    // === VALIDATION: Numeric check ===
    const numericBidPrice = Number(bid_price);
    if (isNaN(numericBidPrice) || numericBidPrice <= 0) {
      throw new Error("Giá đấu giá phải là số dương hợp lệ");
    }

    // Lấy sản phẩm hiện tại để validate bid
    const product = await db("product")
      .where("id_product", id_product)
      .first();

    console.log("Product found:", product);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // === VALIDATION: Product status must be 'active' ===
    if (product.status !== 'active') {
      throw new Error("Phiên đấu giá đã kết thúc hoặc không còn hoạt động");
    }

    // === VALIDATION: Check end_date_time ===
    if (product.end_date_time && new Date() >= new Date(product.end_date_time)) {
      throw new Error("Phiên đấu giá đã kết thúc");
    }

    // Kiểm tra seller không thể đấu giá sản phẩm của chính mình
    const sellerId = product.updated_by || product.created_by;
    console.log("Checking self-bid - seller:", sellerId, "id_user:", id_user);
    if (sellerId === id_user) {
      throw new Error("Bạn không thể đấu giá sản phẩm của chính mình");
    }

    // Kiểm tra xem bidder có bị kick khỏi sản phẩm này không
    const kickRecord = await db("kick")
      .where("id_product", id_product)
      .where("id_user", id_user)
      .first();
    if (kickRecord) {
      throw new Error("Bạn đã bị kick khỏi phiên đấu giá này và không thể tham gia đấu giá");
    }

    // Kiểm tra bidder và lấy rating từ user_point
    const bidder = await db("user")
      .select("user.*", "user_point.judge_point", "user_point.number_of_plus", "user_point.number_of_minus")
      .leftJoin("user_point", "user.id_user", "user_point.id_user")
      .where("user.id_user", id_user)
      .first();

    console.log("Bidder found:", bidder);

    if (!bidder) {
      throw new Error("Người dùng không tồn tại");
    }

    // === BIDDER RATING CHECK ===
    // Tính rating percent từ user_point
    const plus = Number(bidder.number_of_plus || 0);
    const minus = Number(bidder.number_of_minus || 0);
    const total = plus + minus;
    const ratingPercent = total > 0 ? (plus / total) : 0;

    console.log("Rating check - plus:", plus, "minus:", minus, "percent:", ratingPercent);

    // Nếu rating > 0 và < 80% → không được đấu giá
    if (ratingPercent > 0 && ratingPercent < 0.8) {
      throw new Error(
        `Điểm đánh giá của bạn (${(ratingPercent * 100).toFixed(1)}%) chưa đủ điều kiện (yêu cầu ≥ 80%). Vui lòng cải thiện điểm đánh giá của bạn`
      );
    }

    // Nếu rating = 0 (chưa có đánh giá) → cần seller approval (bid_request flow)
    if (ratingPercent === 0) {
      console.log("Rating = 0, checking bid_request flow...");

      const approvedRequest = await db("bid_request")
        .where("id_bidder", id_user)
        .where("id_product", id_product)
        .where("id_seller", sellerId)
        .where("status", "approved")
        .first();

      if (approvedRequest) {
        console.log("Found approved request, proceeding to bid");
      } else {
        // Check for existing pending request
        const existingRequest = await db("bid_request")
          .where("id_bidder", id_user)
          .where("id_product", id_product)
          .where("id_seller", sellerId)
          .where("status", "pending")
          .first();

        if (existingRequest) {
          return {
            status: "success",
            message: "Yêu cầu duyệt từ bạn đang chờ xử lý. Vui lòng chờ người bán phê duyệt",
            data: existingRequest,
            requiresApproval: true,
          };
        }

        // Check for rejected request
        const rejectedRequest = await db("bid_request")
          .where("id_bidder", id_user)
          .where("id_product", id_product)
          .where("id_seller", sellerId)
          .where("status", "rejected")
          .first();

        if (rejectedRequest) {
          throw new Error("Yêu cầu đấu giá của bạn đã bị từ chối. Bạn không thể đấu giá sản phẩm này");
        }

        // Create new bid_request
        console.log("Creating new bid_request...");
        const [bidRequest] = await db("bid_request")
          .insert({
            id_bidder: id_user,
            id_product,
            id_seller: sellerId,
            bid_price: numericBidPrice,
            status: "pending",
            created_at: new Date(),
          })
          .returning("*");

        return {
          status: "success",
          message: "Yêu cầu của bạn đã được gửi tới người bán. Vui lòng chờ phê duyệt",
          data: bidRequest,
          requiresApproval: true,
        };
      }
    }

    // rating >= 80% → cho phép đấu giá trực tiếp

    // === DETERMINE CURRENT PRICE ===
    const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
    console.log("Current price:", currentPrice, "(from", product.price !== null ? "product.price" : "starting_price", ")");

    // === VALIDATE BID PRICE ===
    const pricingStep = Number(product.pricing_step || 0);
    const minBidPrice = currentPrice + pricingStep;
    console.log("Min bid price:", minBidPrice, "(current:", currentPrice, "+ step:", pricingStep, ")");

    // === IMMEDIATE PURCHASE CHECK ===
    const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;
    let isImmediatePurchase = false;
    let finalBidPrice = numericBidPrice;

    if (immediatePrice && numericBidPrice >= immediatePrice) {
      isImmediatePurchase = true;
      finalBidPrice = immediatePrice; // Cap at immediate price
      console.log("Immediate purchase triggered, bid price capped to:", finalBidPrice);
    } else {
      // Normal bid - check minimum price
      if (numericBidPrice < minBidPrice) {
        throw new Error(
          `Giá đấu giá tối thiểu là ${parseInt(minBidPrice).toLocaleString("vi-VN")} VND (giá hiện tại + bước giá)`
        );
      }
    }

    // === USE TRANSACTION FOR BID INSERT + PRODUCT UPDATE ===
    const result = await db.transaction(async (trx) => {
      // Insert bid
      const [newBid] = await trx("bid")
        .insert({
          id_product,
          id_user,
          bid_price: finalBidPrice,
          time: new Date(),
        })
        .returning("*");

      console.log("New bid inserted:", newBid);

      // Update product
      const updateData = { price: finalBidPrice };

      if (isImmediatePurchase) {
        // End auction immediately
        updateData.status = "ended_success";
        updateData.end_date_time = new Date();
        console.log("Immediate purchase - ending auction");

        // Create winner_order
        await trx("winner_order").insert({
          id_product,
          id_user,
          address: "Chưa cung cấp",
          status: "pending_payment",
        });
        console.log("Winner order created for immediate purchase");
      }

      await trx("product")
        .where("id_product", id_product)
        .update(updateData);

      return newBid;
    });

    console.log("=== BID SERVICE SUCCESS ===");

    // === SEND EMAIL NOTIFICATIONS ===
    try {
      const productUrl = `${process.env.FRONTEND_URL}/product/${id_product}`;

      // Get bidder info
      const bidder = await db("user").where("id_user", id_user).first();
      
      // Get seller info
      const seller = await db("user").where("id_user", product.updated_by || product.created_by).first();

      // 1. Send email to bidder (bid success)
      if (bidder?.email) {
        await sendBidSuccessMail(
          bidder.email,
          bidder.fullname,
          product.name,
          finalBidPrice,
          productUrl
        );
      }

      // 2. Send email to seller (new bid notification)
      if (seller?.email) {
        await sendNewBidNotificationMail(
          seller.email,
          seller.fullname,
          product.name,
          bidder?.fullname || "Người đấu giá",
          finalBidPrice,
          productUrl
        );
      }

      // 3. Send email to previous bidders who have been outbid (excluding current bidder)
      const previousBidders = await db("bid")
        .select("user.id_user", "user.email", "user.fullname")
        .leftJoin("user", "bid.id_user", "user.id_user")
        .where("bid.id_product", id_product)
        .whereNot("bid.id_user", id_user)
        .groupBy("user.id_user", "user.email", "user.fullname");

      for (const prevBidder of previousBidders) {
        if (prevBidder.email) {
          await sendOutbidNotificationMail(
            prevBidder.email,
            prevBidder.fullname,
            product.name,
            finalBidPrice,
            productUrl
          );
        }
      }
    } catch (emailError) {
      console.error("Failed to send bid notification emails:", emailError);
      // Don't throw - bid was successful, email is secondary
    }

    // Run auto-bid engine after manual bid (non-blocking)
    if (!isImmediatePurchase) {
      setImmediate(async () => {
        try {
          await runAutoBidEngine(id_product);
        } catch (autoBidError) {
          console.error("Auto-bid engine error:", autoBidError);
        }
      });
    }

    return {
      status: "success",
      message: isImmediatePurchase ? "Mua ngay thành công! Bạn là người thắng đấu giá." : "Đấu giá thành công",
      data: result,
      isImmediatePurchase,
    };
  } catch (error) {
    console.log("=== BID SERVICE ERROR ===");
    console.log("Error:", error.message);
    throw error;
  }
};

export const getBidRequests = async (id_seller) => {
  try {
    console.log("=== getBidRequests SERVICE ===");
    console.log("id_seller param:", id_seller);

    const bidRequests = await db("bid_request")
      .select(
        "bid_request.*",
        "product.name as product_name",
        "product.avatar as product_avatar",
        "bidder.fullname as bidder_name",
        "bidder.email as bidder_email"
      )
      .leftJoin("product", "bid_request.id_product", "product.id_product")
      .leftJoin("user as bidder", "bid_request.id_bidder", "bidder.id_user")
      .where("bid_request.id_seller", id_seller)
      .andWhere("bid_request.status", "pending")
      .orderBy("bid_request.created_at", "desc");

    console.log("Query result:", bidRequests);
    console.log("Total records:", bidRequests?.length || 0);

    return bidRequests;
  } catch (error) {
    console.log("=== getBidRequests ERROR ===");
    console.log("Error:", error.message);
    throw error;
  }
};

export const getBidRequestsByProduct = async (id_product) => {
  try {
    const bidRequests = await db("bid_request")
      .select(
        "bid_request.*",
        "bidder.fullname as bidder_name",
        "bidder.email as bidder_email"
      )
      .leftJoin("user as bidder", "bid_request.id_bidder", "bidder.id_user")
      .where("bid_request.id_product", id_product)
      .andWhere("bid_request.status", "pending")
      .orderBy("bid_request.created_at", "desc");

    return bidRequests;
  } catch (error) {
    throw error;
  }
};

export const approveBidRequest = async (id_request, id_seller) => {
  try {
    const bidRequest = await db("bid_request")
      .where("id", id_request)
      .where("id_seller", id_seller)
      .first();

    if (!bidRequest) {
      throw new Error("Không tìm thấy yêu cầu đấu giá");
    }

    if (bidRequest.status !== "pending") {
      throw new Error("Yêu cầu đã được xử lý");
    }

    // === VALIDATE PRODUCT STILL ACTIVE ===
    const product = await db("product")
      .where("id_product", bidRequest.id_product)
      .first();

    if (!product) {
      throw new Error("Sản phẩm không còn tồn tại");
    }

    if (product.status !== "active") {
      // Auto-reject request since auction ended
      await db("bid_request")
        .where("id", id_request)
        .update({ status: "rejected", updated_at: new Date() });
      throw new Error("Phiên đấu giá đã kết thúc, không thể phê duyệt yêu cầu này");
    }

    if (product.end_date_time && new Date() >= new Date(product.end_date_time)) {
      await db("bid_request")
        .where("id", id_request)
        .update({ status: "rejected", updated_at: new Date() });
      throw new Error("Phiên đấu giá đã kết thúc, không thể phê duyệt yêu cầu này");
    }

    // === VALIDATE BID PRICE ===
    const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
    const pricingStep = Number(product.pricing_step || 0);
    const minBidPrice = currentPrice + pricingStep;
    const requestedPrice = Number(bidRequest.bid_price);

    // Check immediate purchase
    const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;
    let isImmediatePurchase = false;
    let finalBidPrice = requestedPrice;

    if (immediatePrice && requestedPrice >= immediatePrice) {
      isImmediatePurchase = true;
      finalBidPrice = immediatePrice;
    } else if (requestedPrice < minBidPrice) {
      // Price no longer valid, reject the request
      await db("bid_request")
        .where("id", id_request)
        .update({ status: "rejected", updated_at: new Date() });
      throw new Error(`Giá đấu (${requestedPrice.toLocaleString("vi-VN")} VND) không còn hợp lệ. Giá tối thiểu hiện tại là ${minBidPrice.toLocaleString("vi-VN")} VND`);
    }

    // === USE TRANSACTION ===
    const result = await db.transaction(async (trx) => {
      // Update bid_request status
      const [updated] = await trx("bid_request")
        .where("id", id_request)
        .update({ status: "approved", updated_at: new Date() })
        .returning("*");

      // Insert bid
      const [newBid] = await trx("bid")
        .insert({
          id_user: bidRequest.id_bidder,
          id_product: bidRequest.id_product,
          bid_price: finalBidPrice,
          time: new Date(),
        })
        .returning("*");

      // Update product
      const updateData = { price: finalBidPrice };

      if (isImmediatePurchase) {
        updateData.status = "ended_success";
        updateData.end_date_time = new Date();

        // Create winner order
        await trx("winner_order").insert({
          id_product: bidRequest.id_product,
          id_user: bidRequest.id_bidder,
          address: "Chưa cung cấp",
          status: "pending_payment",
        });
      }

      await trx("product")
        .where("id_product", bidRequest.id_product)
        .update(updateData);

      console.log("Bid approved and inserted:", newBid);

      return { updated, newBid, isImmediatePurchase };
    });

    return result.updated;
  } catch (error) {
    throw error;
  }
};

export const rejectBidRequest = async (id_request, id_seller) => {
  try {
    const bidRequest = await db("bid_request")
      .where("id", id_request)
      .where("id_seller", id_seller)
      .first();

    if (!bidRequest) {
      throw new Error("Không tìm thấy yêu cầu đấu giá");
    }

    if (bidRequest.status !== "pending") {
      throw new Error("Yêu cầu đã được xử lý");
    }

    const [updated] = await db("bid_request")
      .where("id", id_request)
      .update({ status: "rejected" })
      .returning("*");

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Get products that user is actively bidding on (Bidding List)
 * 
 * Definition: Products where:
 * 1. User has placed at least one bid (bid.id_user = current_user.id)
 * 2. product.end_date_time > NOW() (auction not ended)
 * 3. Product status is 'active'
 * 
 * Returns one product only once even if user bid multiple times
 */
export const getMyBiddingProducts = async (id_user) => {
  try {
    console.log("=== getMyBiddingProducts SERVICE ===");
    console.log("id_user:", id_user);

    const now = new Date();

    // Get distinct products where user has bid and auction not ended yet
    const products = await db("bid")
      .select(
        "product.id_product",
        "product.name",
        "product.avatar",
        "product.starting_price",
        "product.end_date_time",
        "product.status"
      )
      .leftJoin("product", "bid.id_product", "product.id_product")
      .where("bid.id_user", id_user)
      .where("product.status", "active")
      .where("product.end_date_time", ">", now)
      .groupBy(
        "product.id_product",
        "product.name",
        "product.avatar",
        "product.starting_price",
        "product.end_date_time",
        "product.status"
      )
      .orderBy("product.end_date_time", "asc"); // Ending soon first

    // For each product, get additional info
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Get all bids for this product
        const bids = await db("bid")
          .select("bid.*", "user.fullname as bidder_name")
          .leftJoin("user", "bid.id_user", "user.id_user")
          .where("bid.id_product", product.id_product)
          .orderBy("bid.bid_price", "desc")
          .orderBy("bid.time", "asc");

        // Total bid count
        const bid_count = bids.length;

        // Current price = MAX(bid_price) or starting_price
        const current_price = bids.length > 0
          ? bids[0].bid_price
          : product.starting_price;

        // Highest bidder info
        const highestBid = bids[0];
        const is_user_leading = highestBid?.id_user === id_user;

        // Mask bidder name (e.g., "Nguyễn Văn A" -> "N***n V*n A")
        const maskName = (name) => {
          if (!name) return "***";
          const parts = name.split(" ");
          return parts.map(part => {
            if (part.length <= 2) return part[0] + "*";
            return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
          }).join(" ");
        };

        const current_highest_bidder = highestBid
          ? maskName(highestBid.bidder_name)
          : null;

        return {
          id_product: product.id_product,
          name: product.name,
          avatar: product.avatar,
          current_price: parseInt(current_price),
          bid_count,
          end_date_time: product.end_date_time,
          is_user_leading,
          current_highest_bidder,
        };
      })
    );

    console.log("Products found:", productsWithDetails.length);
    return productsWithDetails;
  } catch (error) {
    console.log("=== getMyBiddingProducts ERROR ===");
    console.log("Error:", error.message);
    throw error;
  }
};

export const getBidderListByProduct = (id_product) => {
  return db("bid")
    .distinct(
      "bid.id_user",
      "user.fullname as bidder_name",
      "user.email as bidder_email",
      db.raw(`
        CASE 
          WHEN kick.id_user IS NOT NULL THEN true
          ELSE false
        END as is_banned
      `)
    )
    .leftJoin("user", "bid.id_user", "user.id_user")
    .leftJoin("kick", function () {
      this.on("kick.id_user", "=", "bid.id_user")
          .andOn("kick.id_product", "=", db.raw("?", [id_product]));
    })
    .where("bid.id_product", id_product);
};

export const kickBidderFromProduct = (id_product, id_bidder) => {
  return db("kick")
    .insert({
      id_product,
      id_user: id_bidder,
      created_at: new Date(),
    });
}

export const recoverBidderToProduct = (id_product, id_bidder) => {
  return db("kick")
    .where("id_product", id_product)
    .where("id_user", id_bidder)
    .del();
}

export const placeAutoBid = async (id_product, max_bid, id_user) => {
  const numericMaxBid = Number(max_bid);
  if (isNaN(numericMaxBid) || numericMaxBid <= 0) {
    throw new Error("Giá đấu giá tự động phải là số dương hợp lệ");
  }

  // Get product
  const product = await db("product")
    .where("id_product", id_product)
    .first();

  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  // Validate product status
  if (product.status !== 'active') {
    throw new Error("Phiên đấu giá đã kết thúc hoặc không còn hoạt động");
  }

  // Validate end_date_time
  if (product.end_date_time && new Date() >= new Date(product.end_date_time)) {
    throw new Error("Phiên đấu giá đã kết thúc");
  }

  // Check seller cannot auto-bid on own product
  const sellerId = product.updated_by || product.created_by;
  if (sellerId === id_user) {
    throw new Error("Bạn không thể đấu giá sản phẩm của chính mình");
  }

  // Check if user is kicked
  const kickRecord = await db("kick")
    .where("id_product", id_product)
    .where("id_user", id_user)
    .first();
  if (kickRecord) {
    throw new Error("Bạn đã bị kick khỏi phiên đấu giá này");
  }

  // Check user rating
  const bidder = await db("user")
    .select("user.*", "user_point.judge_point", "user_point.number_of_plus", "user_point.number_of_minus")
    .leftJoin("user_point", "user.id_user", "user_point.id_user")
    .where("user.id_user", id_user)
    .first();

  if (!bidder) {
    throw new Error("Người dùng không tồn tại");
  }

  const plus = Number(bidder.number_of_plus || 0);
  const minus = Number(bidder.number_of_minus || 0);
  const total = plus + minus;
  const ratingPercent = total > 0 ? (plus / total) : 0;

  // Rating must be >= 80% to use auto-bid
  if (total > 0 && ratingPercent < 0.8) {
    throw new Error(
      `Điểm đánh giá của bạn (${(ratingPercent * 100).toFixed(1)}%) chưa đủ điều kiện (yêu cầu ≥ 80%)`
    );
  }

  // If no rating, check for approved bid_request
  if (ratingPercent === 0) {
    const approvedRequest = await db("bid_request")
      .where("id_bidder", id_user)
      .where("id_product", id_product)
      .where("id_seller", sellerId)
      .where("status", "approved")
      .first();

    if (!approvedRequest) {
      throw new Error("Bạn cần được seller phê duyệt trước khi đặt auto-bid");
    }
  }

  // Validate max_bid >= current_price + pricing_step
  const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
  const pricingStep = Number(product.pricing_step || 0);
  const minMaxBid = currentPrice + pricingStep;

  if (numericMaxBid < minMaxBid) {
    throw new Error(
      `Giá auto-bid tối thiểu phải là ${parseInt(minMaxBid).toLocaleString("vi-VN")} VND`
    );
  }

  // Check if user already has auto-bid for this product
  const existingAutoBid = await db("auto_bid")
    .where("id_product", id_product)
    .where("id_user", id_user)
    .first();

  let autoBidResult;

  if (existingAutoBid) {
    // Update existing auto-bid
    [autoBidResult] = await db("auto_bid")
      .where("id_bid", existingAutoBid.id_bid)
      .update({
        max_bid: numericMaxBid,
      })
      .returning("*");
  } else {
    // Insert new auto-bid
    [autoBidResult] = await db("auto_bid")
      .insert({
        id_product,
        id_user,
        max_bid: numericMaxBid,
      })
      .returning("*");
  }

  // Run auto-bid engine after placing/updating auto-bid
  await runAutoBidEngine(id_product);

  return {
    status: "success",
    message: existingAutoBid ? "Cập nhật auto-bid thành công" : "Đặt auto-bid thành công",
    data: autoBidResult,
  };
};

/**
 * Get user's auto-bid for a product
 */
export const getAutoBid = async (id_product, id_user) => {
  const autoBid = await db("auto_bid")
    .where("id_product", id_product)
    .where("id_user", id_user)
    .first();

  return autoBid || null;
};

/**
 * Delete user's auto-bid for a product
 */
export const deleteAutoBid = async (id_product, id_user) => {
  const deleted = await db("auto_bid")
    .where("id_product", id_product)
    .where("id_user", id_user)
    .del();

  if (!deleted) {
    throw new Error("Không tìm thấy auto-bid để xóa");
  }

  return { status: "success", message: "Đã xóa auto-bid" };
};

/**
 * Auto-bid engine - processes auto-bids for a product
 * Called when: new auto-bid created/updated, manual bid placed
 */
export const runAutoBidEngine = async (id_product) => {
  console.log("=== AUTO-BID ENGINE START ===", id_product);

  return await db.transaction(async (trx) => {
    // Step 1: Lock product with FOR UPDATE
    const product = await trx("product")
      .where("id_product", id_product)
      .where("status", "active")
      .forUpdate()
      .first();

    if (!product) {
      console.log("Product not found or not active");
      return null;
    }

    // Check if auction ended
    if (product.end_date_time && new Date() >= new Date(product.end_date_time)) {
      console.log("Auction has ended");
      return null;
    }

    const currentPrice = product.price !== null ? Number(product.price) : Number(product.starting_price || 0);
    const pricingStep = Number(product.pricing_step || 0);
    const immediatePrice = product.immediate_purchase_price ? Number(product.immediate_purchase_price) : null;

    console.log("Current price:", currentPrice, "Pricing step:", pricingStep);

    // Step 2: Get all auto-bids for this product (excluding kicked users)
    const autoBids = await trx("auto_bid")
      .select("auto_bid.*", "user.fullname", "user.email")
      .leftJoin("user", "auto_bid.id_user", "user.id_user")
      .leftJoin("kick", function() {
        this.on("kick.id_user", "=", "auto_bid.id_user")
            .andOn("kick.id_product", "=", "auto_bid.id_product");
      })
      .where("auto_bid.id_product", id_product)
      .whereNull("kick.id_user") // Exclude kicked users
      .orderBy("auto_bid.max_bid", "desc")


    console.log("Auto-bids found:", autoBids.length);

    if (autoBids.length === 0) {
      console.log("No auto-bids found");
      return null;
    }

    // Step 3: Calculate new price
    let newPrice;
    let winner = autoBids[0];

    if (autoBids.length === 1) {
      // Only one auto-bid: bid at minimum increment
      newPrice = Math.min(Number(winner.max_bid), currentPrice + pricingStep);
    } else {
      // Multiple auto-bids: winner outbids runner-up
      const runnerUp = autoBids[1];
      newPrice = Math.min(
        Number(winner.max_bid),
        Number(runnerUp.max_bid) + pricingStep
      );
    }

    console.log("Calculated new price:", newPrice);

    // If new price <= current price, no action needed
    if (newPrice <= currentPrice) {
      console.log("New price not higher than current, stopping");
      return null;
    }

    // Check for immediate purchase
    let isImmediatePurchase = false;
    if (immediatePrice && newPrice >= immediatePrice) {
      newPrice = immediatePrice;
      isImmediatePurchase = true;
      console.log("Immediate purchase triggered at:", newPrice);
    }

    // Step 4: Insert bid record
    const [newBid] = await trx("bid")
      .insert({
        id_product,
        id_user: winner.id_user,
        bid_price: newPrice,
        time: new Date(),
        is_auto_bid: true, // Mark as auto-bid
      })
      .returning("*");

    console.log("Auto-bid inserted:", newBid);

    // Update product price
    const updateData = { price: newPrice };

    if (isImmediatePurchase) {
      updateData.status = "ended_success";
      updateData.end_date_time = new Date();

      // Create winner_order
      await trx("winner_order").insert({
        id_product,
        id_user: winner.id_user,
        address: "Chưa cung cấp",
        status: "pending_payment",
      });
      console.log("Immediate purchase - winner order created");
    }

    await trx("product")
      .where("id_product", id_product)
      .update(updateData);

    // Step 5: Anti-sniping - extend auction time if needed
    if (!isImmediatePurchase) {
      await extendAuctionTimeIfNeeded(trx, id_product);
    }

    console.log("=== AUTO-BID ENGINE SUCCESS ===");

    // Send email notifications (outside transaction)
    setImmediate(async () => {
      try {
        const productUrl = `${process.env.FRONTEND_URL}/product/${id_product}`;
        
        // Send email to winner (auto-bid success)
        if (winner.email) {
          await sendBidSuccessMail(
            winner.email,
            winner.fullname,
            product.name,
            newPrice,
            productUrl
          );
        }

        // Send email to seller
        const seller = await db("user").where("id_user", product.updated_by || product.created_by).first();
        if (seller?.email) {
          await sendNewBidNotificationMail(
            seller.email,
            seller.fullname,
            product.name,
            winner.fullname,
            newPrice,
            productUrl
          );
        }

        // Send outbid notification to other auto-bidders
        for (let i = 1; i < autoBids.length; i++) {
          const outbidUser = autoBids[i];
          if (outbidUser.email) {
            await sendOutbidNotificationMail(
              outbidUser.email,
              outbidUser.fullname,
              product.name,
              newPrice,
              productUrl
            );
          }
        }
      } catch (emailError) {
        console.error("Failed to send auto-bid emails:", emailError);
      }
    });

    return {
      newBid,
      winner: winner.id_user,
      newPrice,
      isImmediatePurchase,
    };
  });
};

/**
 * Extend auction time if bid is placed near the end (anti-sniping)
 */
const extendAuctionTimeIfNeeded = async (trx, id_product) => {
  const settings = await trx("auction_settings").first();
  
  if (!settings || !settings.extend_threshold_minutes || !settings.extend_duration_minutes) {
    return false;
  }

  const product = await trx("product")
    .where("id_product", id_product)
    .first();

  if (!product || !product.end_date_time) {
    return false;
  }

  const now = new Date();
  const endTime = new Date(product.end_date_time);
  const thresholdMs = settings.extend_threshold_minutes * 60 * 1000;
  const remainingMs = endTime.getTime() - now.getTime();

  // If remaining time <= threshold, extend
  if (remainingMs <= thresholdMs && remainingMs > 0) {
    const extensionMs = settings.extend_duration_minutes * 60 * 1000;
    const newEndTime = new Date(endTime.getTime() + extensionMs);

    await trx("product")
      .where("id_product", id_product)
      .update({ end_date_time: newEndTime });

    console.log(`Auction extended by ${settings.extend_duration_minutes} minutes to ${newEndTime}`);
    return true;
  }

  return false;
};