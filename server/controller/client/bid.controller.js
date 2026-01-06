import * as bidService from '../../service/bid.service.js';

export const placeBidPost = async (req, res) => {
  try {
    const { id_product, bid_price, id_user } = req.body;
    
    console.log("=== BID REQUEST ===");
    console.log("Request body:", req.body);
    console.log("id_product:", id_product);
    console.log("bid_price:", bid_price);
    console.log("id_user:", id_user);
    console.log("User from token:", req.user);

    const result = await bidService.placeBid(id_product, bid_price, id_user);
    
    console.log("=== BID RESULT ===");
    console.log("Result:", result);

    return res.json({
      code: result.status,      // "success" | "pending_approval"
      message: result.message,  
      data: result.data,
    });
  } catch (error) {
    console.log("=== BID ERROR ===");
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    res.status(400).json({ code: "error", message: error.message });
  }
}

export const bidRequestGet = async (req, res) => {
  try {
    console.log("=== GET BID REQUESTS ===");
    console.log("req.account:", req.account);
    const id_seller = req.account?.id_user;
    console.log("id_seller:", id_seller);
    
    if (!id_seller) {
      console.log("ERROR: id_seller is undefined");
      return res.status(400).json({ code: "error", message: "Không tìm thấy thông tin người bán" });
    }
    
    const result = await bidService.getBidRequests(id_seller);
    console.log("Bid requests found:", result?.length || 0);
    console.log("Result:", result);

    return res.json({
      code: "success",
      message: "Bid requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log("=== GET BID REQUESTS ERROR ===");
    console.log("Error:", error.message);
    res.status(400).json({ code: "error", message: error.message });
  }
}

export const approveBidRequestPost = async (req, res) => {
  try {
    const { id_request } = req.body;
    const id_seller = req.account.id_user;

    const result = await bidService.approveBidRequest(id_request, id_seller);

    return res.json({
      code: "success",
      message: "Đã phê duyệt yêu cầu đấu giá",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
}

export const rejectBidRequestPost = async (req, res) => {
  try {
    const { id_request } = req.body;
    const id_seller = req.account.id_user;

    const result = await bidService.rejectBidRequest(id_request, id_seller);

    return res.json({
      code: "success",
      message: "Đã từ chối yêu cầu đấu giá",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
}