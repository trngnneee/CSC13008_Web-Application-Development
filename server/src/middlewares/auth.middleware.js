import jwt from 'jsonwebtoken';
import { findUserById } from '../services/user.service.js';
import { ROLES } from '../constants/index.js';

export const verifyClientToken = async (req, res, next) => {
  try {
    let token = req.cookies.clientToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        code: 'error',
        message: 'Vui lòng đăng nhập để tiếp tục!',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id_user);

    if (!user) {
      res.clearCookie('clientToken');
      return res.status(401).json({
        code: 'error',
        message: 'Tài khoản không tồn tại trong hệ thống!',
      });
    }

    req.account = user;
    req.account.role = user.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.clearCookie('clientToken');
      return res.status(401).json({
        code: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn!',
      });
    }
    next(error);
  }
};

export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        code: 'error',
        message: 'Token không tồn tại!',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id_user);

    if (!user) {
      res.clearCookie('adminToken');
      return res.status(401).json({
        code: 'error',
        message: 'Tài khoản không tồn tại trong hệ thống!',
      });
    }

    if (user.role !== decoded.role) {
      res.clearCookie('adminToken');
      return res.status(403).json({
        code: 'error',
        message: 'Token không hợp lệ (role không khớp)!',
      });
    }

    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        code: 'error',
        message: 'Bạn không có quyền truy cập tài nguyên admin!',
      });
    }

    req.account = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.clearCookie('adminToken');
      return res.status(401).json({
        code: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn!',
      });
    }
    next(error);
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.account || !allowedRoles.includes(req.account.role)) {
      return res.status(403).json({
        code: 'error',
        message: 'Bạn không có quyền truy cập tài nguyên này!',
      });
    }
    next();
  };
};
