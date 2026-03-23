import asyncHandler from '../utils/asyncHandler.js';
import { parseProductsCsv } from '../utils/csvParser.js';
import * as productService from '../services/product.service.js';
import { uploadImagesToSupabase, uploadImageToSupabase, deleteImageFromSupabase } from '../services/upload.service.js';
import { getAllChildCategoryIDs } from '../services/category.service.js';
import { sendDescriptionChangeMail } from '../services/mail.service.js';
import db from '../config/database.js';
import JSZip from 'jszip';

export const uploadCSVProduct = asyncHandler(async (req, res) => {
  const files = req.files;
  const csvFile = files?.csv?.[0];
  const zipFile = files?.images?.[0];

  if (!csvFile) {
    return res.status(400).json({ code: 'error', message: 'File CSV là bắt buộc' });
  }

  const { records, unknownColumns, missingColumns } = await parseProductsCsv(csvFile.buffer);

  // Extract images from ZIP if provided
  const imageMap = new Map();
  if (zipFile) {
    const zip = await JSZip.loadAsync(zipFile.buffer);
    const imageFiles = Object.keys(zip.files).filter(
      (filename) => !zip.files[filename].dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    );

    for (const filename of imageFiles) {
      const fileData = await zip.files[filename].async('nodebuffer');
      const baseName = filename.split('/').pop();
      imageMap.set(baseName, fileData);
    }
  }

  // Process records: upload images and update URLs
  for (const record of records) {
    if (record.avatar && imageMap.has(record.avatar)) {
      try {
        record.avatar = await uploadImageToSupabase(imageMap.get(record.avatar), record.avatar);
      } catch {
        record.avatar = null;
      }
    }

    if (record.url_img && Array.isArray(record.url_img)) {
      const uploadedUrls = [];
      for (const imgFilename of record.url_img) {
        if (imageMap.has(imgFilename)) {
          try {
            uploadedUrls.push(await uploadImageToSupabase(imageMap.get(imgFilename), imgFilename));
          } catch { /* skip failed uploads */ }
        }
      }
      record.url_img = uploadedUrls.length > 0 ? uploadedUrls : null;
    }
  }

  const result = await productService.insertListProducts(records);

  return res.json({
    code: 'success',
    message: 'Upload sản phẩm thành công',
    data: {
      ...result,
      unknownColumns,
      missingColumns,
      imagesUploaded: imageMap.size,
    },
  });
});

export const deleteProductByID = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm.' });
  }

  // Delete images from storage
  if (product.avatar) {
    try { await deleteImageFromSupabase(product.avatar); } catch { /* ignore */ }
  }
  if (product.url_img && Array.isArray(product.url_img)) {
    for (const imageUrl of product.url_img) {
      try { await deleteImageFromSupabase(imageUrl); } catch { /* ignore */ }
    }
  }

  await productService.deleteProductID(req.params.id);
  return res.json({ code: 'success', message: 'Xóa sản phẩm thành công' });
});

export const insertProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  const files = req.files || {};

  if (!files || files.length < 3) {
    return res.status(400).json({
      code: 'error',
      message: 'Vui lòng tải lên ít nhất 3 hình ảnh sản phẩm!',
    });
  }

  productData.created_by = req.account?.id_user || null;
  productData.updated_by = req.account?.id_user || null;
  if (files && files.length > 0) {
    productData.url_img = files.map((file) => file.path);
  }

  const toNumericOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const [product] = await db('product')
    .insert({
      id_category: productData.id_category,
      avatar: files && files.length > 0 ? files[0].path : null,
      name: productData.name,
      price: toNumericOrNull(productData.price),
      immediate_purchase_price: toNumericOrNull(productData.immediate_purchase_price),
      posted_date_time: new Date(),
      description: productData.description,
      pricing_step: toNumericOrNull(productData.pricing_step),
      starting_price: toNumericOrNull(productData.starting_price),
      url_img: productData.url_img,
      updated_by: productData.updated_by,
      created_by: productData.created_by,
      end_date_time: productData.end_date_time || null,
    })
    .returning('id_product');

  await db('description_history').insert({
    id_product: product.id_product,
    time: new Date(),
    description: productData.description,
  });

  return res.json({ code: 'success', message: 'Thêm sản phẩm thành công' });
});

export const updateProductDescription = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { description } = req.body;

  await db('description_history').insert({
    id_product: id,
    time: new Date(),
    description,
  });

  // Send email to all bidders of this product
  try {
    const product = await db('product').where('id_product', id).first();

    if (product && product.status === 'active') {
      const bidders = await db('bid')
        .select('user.id_user', 'user.email', 'user.fullname')
        .leftJoin('user', 'bid.id_user', 'user.id_user')
        .where('bid.id_product', id)
        .groupBy('user.id_user', 'user.email', 'user.fullname');

      const productUrl = `${process.env.FRONTEND_URL}/product/${id}`;

      for (const bidder of bidders) {
        if (bidder.email) {
          await sendDescriptionChangeMail(bidder.email, bidder.fullname, product.name, productUrl);
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to send description change emails:', emailError);
  }

  return res.json({ code: 'success', message: 'Cập nhật mô tả sản phẩm thành công' });
});

export const getProductDescriptionHistory = asyncHandler(async (req, res) => {
  const descriptionHistory = await db('description_history')
    .select('*')
    .where('id_product', req.params.id)
    .orderBy('time', 'desc');

  return res.json({
    code: 'success',
    message: 'Lấy lịch sử mô tả sản phẩm thành công',
    descriptionHistory,
  });
});

export const getProductBidHistory = asyncHandler(async (req, res) => {
  const bidHistory = await db('bid')
    .select('bid.bid_price', 'bid.time', 'user.fullname as bidder_name', 'user.email as bidder_email')
    .leftJoin('user', 'bid.id_user', 'user.id_user')
    .where('bid.id_product', req.params.id)
    .orderBy('bid.time', 'desc');

  const maskedHistory = bidHistory.map((bid) => ({
    ...bid,
    bidder_display: bid.bidder_email
      ? `${bid.bidder_email[0]}${'*'.repeat(8)}${bid.bidder_email.slice(-3)}`
      : bid.bidder_name || 'Ẩn danh',
  }));

  return res.json({
    code: 'success',
    message: 'Lấy lịch sử đấu giá thành công',
    data: maskedHistory,
  });
});

export const getTotalPage = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  return res.json({
    code: 'success',
    message: 'Lấy danh sách sản phẩm thành công',
    data: Math.ceil(products.length / 5),
  });
});

export const getProductDetail = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm.' });
  }

  return res.json({
    code: 'success',
    message: 'Lấy chi tiết sản phẩm thành công',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const productData = req.body;

  if (req.account?.id_user) {
    productData.updated_by = req.account.id_user;
  }

  const oldProduct = await productService.getProduct(id);
  if (!oldProduct) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm.' });
  }

  const files = req.files || {};

  // Handle avatar upload
  if (files?.avatar?.[0]) {
    if (oldProduct.avatar) {
      try { await deleteImageFromSupabase(oldProduct.avatar); } catch { /* ignore */ }
    }

    const avatarFile = files.avatar[0];
    productData.avatar = await uploadImageToSupabase(avatarFile.buffer, avatarFile.originalname);
  }

  // Handle images upload
  if (files?.images && files.images.length > 0) {
    if (oldProduct.url_img && Array.isArray(oldProduct.url_img)) {
      for (const imageUrl of oldProduct.url_img) {
        try { await deleteImageFromSupabase(imageUrl); } catch { /* ignore */ }
      }
    }

    const imageUrls = await uploadImagesToSupabase(files.images);
    productData.url_img = imageUrls;
  }

  const updatedProduct = await productService.updateProduct(id, productData);

  if (!updatedProduct) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm.' });
  }

  return res.json({
    code: 'success',
    message: 'Cập nhập sản phẩm thành công',
    data: updatedProduct,
  });
});

export const getProductList = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.keyword) filter.keyword = req.query.keyword;
  if (req.query.page) {
    filter.page = parseInt(req.query.page);
    filter.limit = 5;
  }
  if (req.query.limit) filter.limitItem = parseInt(req.query.limit);

  const products = await productService.getAllProducts(filter);
  return res.json({
    code: 'success',
    message: 'Lấy danh sách sản phẩm thành công',
    data: products,
  });
});

export const getTopPriceProductList = asyncHandler(async (req, res) => {
  const productList = await db('product')
    .select('product.*', 'user.fullname as seller')
    .join('user', 'product.created_by', 'user.id_user')
    .where('product.status', 'active')
    .where('product.end_date_time', '>', db.fn.now())
    .orderBy('price', 'desc')
    .limit(5);

  return res.json({
    code: 'success',
    message: 'Lấy danh sách Top 5 sản phẩm chưa kết thúc có giá cao nhất thành công',
    productList,
  });
});

export const getEndingSoonProductList = asyncHandler(async (req, res) => {
  const productList = await db('product')
    .select('product.*', 'user.fullname as seller')
    .join('user', 'product.created_by', 'user.id_user')
    .where('product.status', 'active')
    .where('product.end_date_time', '>', db.fn.now())
    .orderBy('end_date_time', 'asc')
    .limit(5);

  return res.json({
    code: 'success',
    message: 'Lấy danh sách Top 5 sản phẩm gần kết thúc thành công',
    productList,
  });
});

export const getMostBiddedProductList = asyncHandler(async (req, res) => {
  const productList = await db('product')
    .select('product.*', 'user.fullname as seller', db.raw('COUNT(bid.id_bid) as bid_count'))
    .join('user', 'product.created_by', 'user.id_user')
    .leftJoin('bid', 'product.id_product', 'bid.id_product')
    .where('product.status', 'active')
    .where('product.end_date_time', '>', db.fn.now())
    .groupBy('product.id_product', 'user.fullname')
    .orderBy('bid_count', 'desc')
    .limit(5);

  return res.json({
    code: 'success',
    message: 'Lấy danh sách Top 5 sản phẩm có nhiều lượt ra giá nhất thành công',
    productList,
  });
});

export const getProductDetailByID = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const productDetail = await db('product')
    .select(
      'product.*',
      'category.name_category',
      'user.fullname as seller',
      'user.id_user as seller_id',
      'user.email as seller_email',
      'user.status as seller_status'
    )
    .where('product.id_product', id)
    .join('category', 'product.id_category', 'category.id_category')
    .join('user', 'product.created_by', 'user.id_user')
    .first();

  if (!productDetail) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm.' });
  }

  if (productDetail.status === 'inactive') {
    return res.status(404).json({ code: 'error', message: 'Sản phẩm này đã bị xóa.' });
  }

  const descriptionHistory = await db('description_history')
    .select('*')
    .where('id_product', id)
    .orderBy('time', 'desc');

  productDetail.descriptionHistory = descriptionHistory;

  return res.json({
    code: 'success',
    message: 'Lấy chi tiết sản phẩm thành công',
    productDetail,
  });
});

export const getProductListBySeller = asyncHandler(async (req, res) => {
  const { sellerID } = req.params;
  const { status: filterStatus } = req.query;

  const query = db('product')
    .where('created_by', sellerID)
    .select('product.*', 'category.name_category')
    .join('category', 'product.id_category', 'category.id_category');

  if (filterStatus === 'active') {
    query.where('product.status', 'active');
  } else if (filterStatus === 'sold') {
    query.whereIn('product.status', ['ended_success', 'ended_no_winner']);
  } else {
    query.where(function () {
      this.where('product.status', '!=', 'inactive').orWhereNull('product.status');
    });
  }

  const pageSize = 5;
  const countQuery = db('product').where('created_by', sellerID);

  if (filterStatus === 'active') {
    countQuery.where('status', 'active');
  } else if (filterStatus === 'sold') {
    countQuery.whereIn('status', ['ended_success', 'ended_no_winner']);
  } else {
    countQuery.where(function () {
      this.where('status', '!=', 'inactive').orWhereNull('status');
    });
  }

  const countResult = await countQuery.count('* as count').first();
  const totalPages = Math.ceil(Number(countResult.count) / pageSize);

  if (req.query.page) {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  const productList = await query;

  return res.json({
    code: 'success',
    message: 'Lấy danh sách sản phẩm của người bán thành công',
    productList,
    totalPages,
  });
});

export const deleteAllProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ code: 'error', message: 'Danh sách ID không hợp lệ.' });
  }

  const products = await productService.getProductsByIds(ids);
  if (!products || products.length === 0) {
    return res.status(404).json({ code: 'error', message: 'Không tìm thấy sản phẩm nào.' });
  }

  // Delete all images from storage
  for (const product of products) {
    if (product.avatar) {
      try { await deleteImageFromSupabase(product.avatar); } catch { /* ignore */ }
    }
    if (product.url_img && Array.isArray(product.url_img)) {
      for (const imageUrl of product.url_img) {
        try { await deleteImageFromSupabase(imageUrl); } catch { /* ignore */ }
      }
    }
  }

  await productService.deleteProductList(ids);
  return res.json({ code: 'success', message: 'Xóa danh sách sản phẩm thành công' });
});

export const getProductListByCategory = asyncHandler(async (req, res) => {
  const { id_category } = req.params;

  const categoryDetail = await db('category').where('id_category', id_category).first();
  if (!categoryDetail) {
    return res.json({ code: 'error', message: 'Không tìm thấy danh mục.' });
  }

  const categoryIDs = await getAllChildCategoryIDs(categoryDetail.id_category);

  const query = db('product')
    .whereIn('id_category', categoryIDs)
    .where('product.status', 'active')
    .where('product.end_date_time', '>', db.fn.now())
    .join('user', 'product.created_by', 'user.id_user')
    .select('product.*', 'user.fullname as seller');

  const pageSize = 4 * 3;
  const countResult = await db('product')
    .whereIn('id_category', categoryIDs)
    .where('status', 'active')
    .where('end_date_time', '>', db.fn.now())
    .count('* as count')
    .first();
  const totalPages = Math.ceil(Number(countResult.count) / pageSize);

  if (req.query.page) {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  if (req.query.status) {
    const status = req.query.status;
    if (status === 'price-asc') query.orderBy('price', 'asc');
    else if (status === 'price-desc') query.orderBy('price', 'desc');
    else if (status === 'end-asc') query.orderBy('posted_date_time', 'asc');
    else if (status === 'end-desc') query.orderBy('posted_date_time', 'desc');
  }

  const productList = await query;

  return res.json({
    code: 'success',
    message: 'Lấy danh sách sản phẩm theo danh mục thành công',
    productList,
    categoryName: categoryDetail.name_category,
    totalPages,
  });
});

export const getTotalPageByCategory = asyncHandler(async (req, res) => {
  const products = await productService.getProductsByCategory(req.params.id_category);
  return res.json({
    code: 'success',
    message: 'Lấy tổng số trang sản phẩm theo danh mục thành công',
    data: Math.ceil(products.length / 5),
  });
});

export const addTimeToAllProducts = asyncHandler(async (req, res) => {
  const { extend_threshold_minutes, extend_duration_minutes } = req.body;
  await productService.addTimeToAllProducts(extend_threshold_minutes, extend_duration_minutes);
  return res.json({ code: 'success', message: 'Thêm thời gian thành công.' });
});

export const getAutoExtendSettings = asyncHandler(async (req, res) => {
  const settings = await productService.getAutoExtendSettings();
  return res.json({
    code: 'success',
    message: 'Lấy cài đặt tự động gia hạn thành công.',
    data: settings,
  });
});

export const getProductsForCron = asyncHandler(async (req, res) => {
  const settings = await db('auction_settings').first();

  if (!settings) {
    return res.json({
      code: 'success',
      message: 'Chưa có cấu hình, dùng giá trị mặc định.',
      data: null,
    });
  }

  return res.json({
    code: 'success',
    message: 'Lấy cấu hình tự động gia hạn thành công',
    data: settings,
  });
});
