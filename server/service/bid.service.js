import db from "../config/database.config.js";

export const placeBid = async (id_product, bid_price, id_user) => {
  try {
    console.log("=== BID SERVICE START ===");
    console.log("Params - id_product:", id_product, "bid_price:", bid_price, "id_user:", id_user);
    
    // Lấy sản phẩm hiện tại để validate bid
    const product = await db("product")
      .where("id_product", id_product)
      .first();

    console.log("Product found:", product);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Kiểm tra seller không thể đấu giá sản phẩm của chính mình
    console.log("Checking self-bid - product.updated_by:", product.updated_by, "id_user:", id_user);
    if (product.updated_by === id_user) {
      throw new Error("Bạn không thể đấu giá sản phẩm của chính mình");
    }

    // Kiểm tra bidder
    const bidder = await db("user")
      .where("id_user", id_user)
      .first();

    console.log("Bidder found:", bidder);

    if (!bidder) {
      throw new Error("Người dùng không tồn tại");
    }

    const judgePoint =
      bidder.judge_point != null ? Number(bidder.judge_point) : 0;

    console.log("Judge point:", judgePoint);

    if (judgePoint === 0) {
      console.log("Judge point is 0, checking bid_request...");
      const approvedRequest = await db("bid_request")
        .where("id_bidder", id_user)
        .where("id_product", id_product)
        .where("id_seller", product.updated_by)
        .first();

      if(approvedRequest.bid_price !== bid_price) {
        return {
          status: "pending_approval",
          message: "Giá đấu giá không khớp với yêu cầu đã phê duyệt trước đó. Vui lòng gửi lại yêu cầu với giá đúng",
          data: approvedRequest,
        }
      }

      if (approvedRequest && approvedRequest.status === "approved") {
        console.log("Found approved request:", approvedRequest);
      } else
      {
        const existingRequest = await db("bid_request")
          .where("id_bidder", id_user)
          .where("id_product", id_product)
          .where("id_seller", product.updated_by)
          .where("status", "pending")
          .first();

        console.log("Existing pending request:", existingRequest);

        if (existingRequest) {
          console.log("Already has pending request");
          return {
            status: "pending_approval",
            message: "Yêu cầu duyệt từ bạn đang chờ xử lý. Vui lòng chờ người bán phê duyệt",
            data: existingRequest,
          };
        }

        console.log("Creating new bid_request...");
        const [bidRequest] = await db("bid_request")
          .insert({
            id_bidder: id_user,
            id_product,
            id_seller: product.updated_by,
            bid_price,
            status: "pending",
            created_at: new Date(),
          })
          .returning("*");

        console.log("Bid request created:", bidRequest);

        return {
          status: "pending_approval",
          message:
            "Yêu cầu của bạn đã được gửi tới người bán. Vui lòng chờ phê duyệt",
          data: bidRequest,
        };
      }
    }

    if (judgePoint > 0 && judgePoint < 0.8) {
      console.log("Judge point too low:", judgePoint);
      throw new Error(
        `Điểm đánh giá của bạn (${(judgePoint * 100).toFixed(
          1
        )}%) chưa đủ điều kiện (yêu cầu ≥ 80%). Vui lòng cải thiện điểm đánh giá của bạn`
      );
    }

    console.log("Checking bid_price:", bid_price, "vs product.price:", product.price);
    
    // Lấy lại giá mới nhất từ database để tránh race condition
    const latestProduct = await db("product")
      .where("id_product", id_product)
      .first();
    
    console.log("Latest product price:", latestProduct.price);
    
    if (bid_price <= latestProduct.price) {
      throw new Error(
        `Giá đấu giá phải lớn hơn giá hiện tại (${parseInt(latestProduct.price).toLocaleString("vi-VN")} VND)`
      );
    }

    const minBidPrice = latestProduct.price + (latestProduct.pricing_step || 0);
    console.log("Min bid price:", minBidPrice, "(price:", latestProduct.price, "+ step:", latestProduct.pricing_step, ")");
    if (bid_price < minBidPrice) {
      throw new Error(
        `Giá đấu giá tối thiểu là ${parseInt(minBidPrice).toLocaleString("vi-VN")} VND (giá hiện tại + bước giá)`
      );
    }

    // Thêm bid mới
    console.log("Inserting new bid...");
    const [newBid] = await db("bid")
      .insert({
        id_product,
        id_user,
        bid_price,
        bid_time: new Date(),
      })
      .returning("*");

    console.log("New bid inserted:", newBid);

    await db("product")
      .where("id_product", id_product)
      .update({ price: bid_price });

    console.log("Product price updated to:", bid_price);
    console.log("=== BID SERVICE SUCCESS ===");

    return {
      status: "success",
      message: "Đấu giá thành công",
      data: newBid,
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

    const [updated] = await db("bid_request")
      .where("id", id_request)
      .update({ status: "approved" })
      .returning("*");

    return updated;
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