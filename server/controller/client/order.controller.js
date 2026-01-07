import * as auctionService from '../../service/auction.service.js';

export const getMyWonOrdersGet = async (req, res) => {
  try {
    const id_user = req.account.id_user;
    const orders = await auctionService.getWinnerOrdersByUser(id_user);

    return res.json({
      code: "success",
      data: orders,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const getMySoldOrdersGet = async (req, res) => {
  try {
    const id_seller = req.account.id_user;
    const orders = await auctionService.getWinnerOrdersBySeller(id_seller);

    return res.json({
      code: "success",
      data: orders,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const getOrderByProductGet = async (req, res) => {
  try {
    const { id_product } = req.params;
    const id_user = req.account.id_user;

    const order = await auctionService.getWinnerOrderByProduct(id_product);

    if (!order) {
      return res.status(404).json({ code: "error", message: "Không tìm thấy đơn hàng" });
    }

    // Check if user is winner or seller
    const isWinner = order.id_user === id_user;
    const isSeller = order.seller_id === id_user;

    if (!isWinner && !isSeller) {
      return res.status(403).json({ code: "error", message: "Bạn không có quyền xem đơn hàng này" });
    }

    return res.json({
      code: "success",
      data: {
        ...order,
        isWinner,
        isSeller,
      },
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const submitPaymentPost = async (req, res) => {
  try {
    const { id_order, address } = req.body;
    const id_user = req.account.id_user;

    // Get payment bill URL from uploaded file
    const payment_bill = req.file ? req.file.path : null;

    if (!payment_bill || !address) {
      return res.status(400).json({ code: "error", message: "Vui lòng cung cấp đầy đủ thông tin (ảnh hóa đơn và địa chỉ)" });
    }

    const result = await auctionService.submitPaymentInfo(id_order, id_user, payment_bill, address);

    return res.json({
      code: "success",
      message: "Đã gửi thông tin thanh toán",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const confirmPaymentPost = async (req, res) => {
  try {
    const { id_order } = req.body;
    const id_seller = req.account.id_user;

    // Get shipping bill URL from uploaded file (optional)
    const b_l = req.file ? req.file.path : null;

    const result = await auctionService.confirmPaymentAndShip(id_order, id_seller, b_l);

    return res.json({
      code: "success",
      message: "Đã xác nhận thanh toán và gửi hàng",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const confirmReceivedPost = async (req, res) => {
  try {
    const { id_order } = req.body;
    const id_user = req.account.id_user;

    const result = await auctionService.confirmReceived(id_order, id_user);

    return res.json({
      code: "success",
      message: "Đã xác nhận nhận hàng",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const rateOrderPost = async (req, res) => {
  try {
    const { id_order, score, comment } = req.body;
    const id_rater = req.account.id_user;

    if (score !== 1 && score !== -1) {
      return res.status(400).json({ code: "error", message: "Điểm đánh giá phải là +1 hoặc -1" });
    }

    if (comment && comment.length > 500) {
      return res.status(400).json({ code: "error", message: "Bình luận không được vượt quá 500 ký tự" });
    }

    const result = await auctionService.rateOrder(id_order, id_rater, score, comment);

    return res.json({
      code: "success",
      message: "Đã đánh giá thành công",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const getRatingStatusGet = async (req, res) => {
  try {
    const { id_order } = req.params;
    const id_user = req.account.id_user;

    const result = await auctionService.getRatingStatus(id_order, id_user);

    return res.json({
      code: "success",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};

export const cancelOrderPost = async (req, res) => {
  try {
    const { id_order } = req.body;
    const id_seller = req.account.id_user;

    const result = await auctionService.cancelOrder(id_order, id_seller);

    return res.json({
      code: "success",
      message: "Đã hủy đơn hàng",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
};
