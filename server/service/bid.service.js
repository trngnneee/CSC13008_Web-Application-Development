import db from "../config/database.config.js";

export const placeBid = async (id_product, bid_price, id_user) => {
  try {
    // Lấy sản phẩm hiện tại để validate bid
    const product = await db("product")
      .where("id_product", id_product)
      .first();

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Kiểm tra bidder
    const bidder = await db("user")
      .where("id_user", id_user)
      .first();

    if (!bidder) {
      throw new Error("Người dùng không tồn tại");
    }

    const judgePoint =
      bidder.judge_point != null ? Number(bidder.judge_point) : 0;

    if (judgePoint === 0) {
      const approvedRequest = await db("bid_request")
        .where("id_bidder", id_user)
        .where("id_product", id_product)
        .where("id_seller", product.id_seller)
        .where("status", "approved")
        .first();

      if (!approvedRequest) {
        const existingRequest = await db("bid_request")
          .where("id_bidder", id_user)
          .where("id_product", id_product)
          .where("id_seller", product.id_seller)
          .where("status", "pending")
          .first();

        if (existingRequest) {
          throw new Error(
            "Yêu cầu duyệt từ bạn đang chờ xử lý. Vui lòng chờ người bán phê duyệt"
          );
        }

        const [bidRequest] = await db("bid_request")
          .insert({
            id_bidder: id_user,
            id_product,
            id_seller: product.id_seller,
            bid_price,
            status: "pending",
            created_at: new Date(),
          })
          .returning("*");

        return {
          status: "pending_approval",
          message:
            "Yêu cầu của bạn đã được gửi tới người bán. Vui lòng chờ phê duyệt",
          data: bidRequest,
        };
      }
    }

    if (judgePoint > 0 && judgePoint < 0.8) {
      throw new Error(
        `Điểm đánh giá của bạn (${(judgePoint * 100).toFixed(
          1
        )}%) chưa đủ điều kiện (yêu cầu ≥ 80%). Vui lòng cải thiện điểm đánh giá của bạn`
      );
    }

    if (bid_price <= product.price) {
      throw new Error(
        `Giá đấu giá phải lớn hơn giá hiện tại (${product.price})`
      );
    }

    const minBidPrice = product.price + (product.pricing_step || 0);
    if (bid_price < minBidPrice) {
      throw new Error(
        `Giá đấu giá tối thiểu là ${minBidPrice} (giá hiện tại + bước giá)`
      );
    }

    // Thêm bid mới
    const [newBid] = await db("bid")
      .insert({
        id_product,
        id_user,
        bid_price,
        bid_time: new Date(),
      })
      .returning("*");

    await db("product")
      .where("id_product", id_product)
      .update({ price: bid_price });

    return {
      status: "success",
      message: "Đấu giá thành công",
      data: newBid,
    };
  } catch (error) {
    throw error;
  }
};
