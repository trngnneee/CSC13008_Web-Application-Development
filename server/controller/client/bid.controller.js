import * as bidService from '../../service/bid.service.js';

export const placeBidPost = async (req, res) => {
  try {
    const { id_product, bid_price, id_user } = req.body;
    
    const result = await bidService.placeBid(id_product, bid_price, id_user);

    res.json({ code: "success", message: "Đấu giá thành công", data: result });
  } catch (error) {
    res.status(400).json({ code: "error", message: error.message });
  }
}