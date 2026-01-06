import db from "../config/database.config.js";

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
 * Get products that user is actively bidding on
 * Returns products where:
 * - User has placed a bid
 * - Product is still active (status = 'active')
 * - Auction hasn't ended yet
 */
export const getMyBiddingProducts = async (id_user) => {
  try {
    console.log("=== getMyBiddingProducts SERVICE ===");
    console.log("id_user:", id_user);

    // Get distinct products where user has bid and product is still active
    const products = await db("bid")
      .select(
        "product.id_product",
        "product.name as product_name",
        "product.avatar as product_avatar",
        "product.price as current_price",
        "product.step_price",
        "product.end_date_time",
        "product.status",
        "seller.fullname as seller_name",
        db.raw("MAX(bid.bid_price) as my_highest_bid"),
        db.raw("COUNT(bid.id) as my_bid_count"),
        db.raw("MIN(bid.time) as first_bid_time")
      )
      .leftJoin("product", "bid.id_product", "product.id_product")
      .leftJoin("user as seller", "product.updated_by", "seller.id_user")
      .where("bid.id_user", id_user)
      .where("product.status", "active")
      .groupBy(
        "product.id_product",
        "product.name",
        "product.avatar",
        "product.price",
        "product.step_price",
        "product.end_date_time",
        "product.status",
        "seller.fullname"
      )
      .orderBy("product.end_date_time", "asc"); // Sắp xếp theo thời gian kết thúc sớm nhất

    // Get highest bid for each product to check if user is winning
    const productsWithStatus = await Promise.all(
      products.map(async (product) => {
        const highestBid = await db("bid")
          .where("id_product", product.id_product)
          .orderBy("bid_price", "desc")
          .orderBy("time", "asc")
          .first();

        return {
          ...product,
          highest_bid: highestBid?.bid_price || product.current_price,
          is_winning: highestBid?.id_user === id_user,
        };
      })
    );

    console.log("Products found:", productsWithStatus.length);
    return productsWithStatus;
  } catch (error) {
    console.log("=== getMyBiddingProducts ERROR ===");
    console.log("Error:", error.message);
    throw error;
  }
};