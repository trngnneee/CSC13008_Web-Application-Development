import * as bidService from '../../service/bid.service.js';

export const placeBidPost = async (req, res) => {
  try {
    const { id_product, bid_price, id_user } = req.body;

    const result = await bidService.placeBid(id_product, bid_price, id_user);

    return res.json({
      code: result.status,      // "success" | "pending_approval"
      message: result.message,  
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
}

export const bidRequestGet = async (req, res) => {
  try {
    const result = await bidService.getBidRequests();

    return res.json({
      code: "success",
      message: "Bid requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
}