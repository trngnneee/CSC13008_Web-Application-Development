import { formatDate } from "../../helper/date.helper.js";
import * as upgradeRequestService from "../../service/upgrade_request.service.js";
import * as userService from "../../service/user.service.js";
import bcrypt from "bcryptjs";
import db from "../../config/database.config.js";

export const requestUpgradeToSeller = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const userRole = req.account?.role; // From middleware

  try {
    // Check if user is already admin
    if (userRole === "admin") {
      return res.status(400).json({
        code: "error",
        message: "Admin không thể nâng cấp thành seller!"
      });
    }

    // Check if user is already seller
    if (userRole === "seller") {
      return res.status(400).json({
        code: "error",
        message: "Bạn đã là seller rồi!"
      });
    }

    // Check if user already has a pending request
    const existingRequest = await upgradeRequestService.checkExistingRequest(id_user);

    if (existingRequest) {
      return res.status(400).json({
        code: "error",
        message: "Bạn đã có một yêu cầu nâng cấp đang chờ xử lý!"
      });
    }

    // Create new upgrade request
    const request = await upgradeRequestService.createUpgradeRequest(id_user);

    return res.json({
      code: "success",
      message: "Gửi yêu cầu nâng cấp thành công! Vui lòng chờ admin duyệt.",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi gửi yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const getMyUpgradeRequest = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware

  try {
    const request = await upgradeRequestService.checkExistingRequest(id_user);

    if (!request) {
      return res.status(404).json({
        code: "error",
        message: "Không có yêu cầu nâng cấp nào!"
      });
    }

    return res.json({
      code: "success",
      message: "Lấy yêu cầu nâng cấp thành công!",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: "Lỗi khi lấy yêu cầu nâng cấp!",
      data: error?.message || error
    });
  }
};

export const updateClientProfile = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { fullname, date_of_birth } = req.body;

  await userService.updateUserById(id_user, { fullname, date_of_birth: formatDate(date_of_birth) });

  res.json({
    code: "success",
    message: "Cập nhật thông tin cá nhân thành công!",
  })
}

export const resetClientPassword = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { old_password, password } = req.body;

  const existUser = await userService.findUserById(id_user);
  if (!existUser) {
    return res.json({
      code: "error",
      message: "Người dùng không tồn tại!",
    });
  }

  if (!bcrypt.compareSync(old_password, existUser.password)) {
    return res.json({
      code: "error",
      message: "Mật khẩu cũ không chính xác!"
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  await userService.resetPassword(id_user, hashPassword);

  res.json({
    code: "success",
    message: "Đổi mật khẩu thành công!",
  })
}

export const addToWishlist = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { id_product } = req.body;

  const existingEntry = await db("watch_list")
    .where({ id_user, id_product })
    .first();

  if (existingEntry) {
    return res.json({
      code: "error",
      message: "Sản phẩm đã có trong danh sách yêu thích!",
    });
  }

  await db("watch_list").insert({
    id_user,
    id_product,
  });

  res.json({
    code: "success",
    message: "Thêm vào danh sách yêu thích thành công!",
  })
}

export const removeFromWishlist = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware
  const { id_product } = req.body;

  await db("watch_list")
    .where({ id_user, id_product })
    .del();

  res.json({
    code: "success",
    message: "Xóa khỏi danh sách yêu thích thành công!",
  })
}

export const getWishlist = async (req, res) => {
  const id_user = req.account?.id_user; // From middleware

  const wishlistIDs = await db("watch_list")
    .where({ id_user })
    .select("id_product");

  let productList = [];
  let query = null;
  let ids = [];
  if (wishlistIDs.length > 0) {
    ids = wishlistIDs.map(entry => entry.id_product);
    query = db("product")
      .select("product.*", 'user.fullname as seller')
      .join("user", "product.created_by", "user.id_user")
      .whereIn("product.id_product", ids)
  }

  const pageSize = 4;
  const countResult = await db('product').whereIn("product.id_product", ids).count('* as count').first();
  const totalPages = Math.ceil(Number(countResult.count) / pageSize);
  if (req.query.page) {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  productList = await query;

  res.json({
    code: "success",
    message: "Lấy danh sách yêu thích thành công!",
    productList: productList,
    totalPages: totalPages,
  })
}

export const getFeedback = async (req, res) => {
  const { role } = req.query;  
  
  const feedbacks = await db('rating')
        .select(
            'rating.content',
            'u.fullname',
            'rating.rating_point'
        )
        .join('user as u', 'rating.reviewer_id', 'u.id_user')
        .where('rating.reviewer_role', role)
        .orderBy('rating.created_at', 'desc');

    res.json({
        code: "success",
        message: "Lấy phản hồi thành công",
        data: feedbacks,
    });
};

export const getFeedbackDetail = async (req, res) => {
  const { id_user } = req.params;  
  
  const feedbacks = await db('rating')
        .select(
            'rating.content',
            'u.fullname',
            'rating.rating_point'
        )
        .join('user as u', 'rating.reviewer_id', 'u.id_user')
        .where('rating.reviewer_role', 'seller')
        .andWhere('rating.reviewee_id', id_user)
        .orderBy('rating.created_at', 'desc');

    res.json({
        code: "success",
        message: "Lấy phản hồi thành công",
        data: feedbacks,
    });
};