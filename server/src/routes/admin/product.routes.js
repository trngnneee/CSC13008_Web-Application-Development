import express from 'express';
import multer from 'multer';
import * as productController from '../../controllers/product.controller.js';
import { verifyAdminToken } from '../../middlewares/auth.middleware.js';
import { uploadCloudinary } from '../../middlewares/upload.middleware.js';

const router = express.Router();

const uploadCSVWithImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCSV =
      ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith('.csv');
    const isZIP =
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed' ||
      file.originalname.toLowerCase().endsWith('.zip');
    return isCSV || isZIP ? cb(null, true) : cb(new Error('Chỉ chấp nhận file CSV và ZIP!'));
  },
});

router.post(
  '/upload-csv',
  uploadCSVWithImages.fields([
    { name: 'csv', maxCount: 1 },
    { name: 'images', maxCount: 1 },
  ]),
  productController.uploadCSVProduct
);

router.post('/create', verifyAdminToken, uploadCloudinary.array('files', 10), productController.insertProduct);
router.get('/total-page', productController.getTotalPage);
router.get('/list', productController.getProductList);
router.delete('/delete-list', verifyAdminToken, productController.deleteAllProducts);
router.post('/add-time', verifyAdminToken, productController.addTimeToAllProducts);
router.get('/auto-extend-settings', verifyAdminToken, productController.getAutoExtendSettings);
router.get('/:id', productController.getProductDetail);
router.patch('/update/:id', verifyAdminToken, uploadCloudinary.array('files', 10), productController.updateProduct);
router.delete('/delete/:id', productController.deleteProductByID);

export default router;
