import express from 'express';
import * as productController from '../../controllers/product.controller.js';
import { verifyClientToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { uploadCloudinary } from '../../middlewares/upload.middleware.js';
import bidRoutes from './bid.routes.js';

const router = express.Router();

router.get('/total-page', productController.getTotalPage);
router.get('/list', productController.getProductList);
router.get('/list/top-price', productController.getTopPriceProductList);
router.get('/list/ending-soon', productController.getEndingSoonProductList);
router.get('/list/most-bidded', productController.getMostBiddedProductList);
router.get('/detail/:id', productController.getProductDetailByID);
router.get('/list/seller/:sellerID', productController.getProductListBySeller);
router.get('/list-category/:id_category', productController.getProductListByCategory);
router.get('/total-page-category/:id_category', productController.getTotalPageByCategory);
router.delete('/delete/:id', verifyClientToken, authorizeRole('seller'), productController.deleteProductByID);
router.post('/create', verifyClientToken, authorizeRole('seller'), uploadCloudinary.array('files', 10), productController.insertProduct);
router.post('/update/:id', verifyClientToken, productController.updateProductDescription);
router.get('/description-history/:id', productController.getProductDescriptionHistory);
router.get('/bid-history/:id', productController.getProductBidHistory);

router.use('/bid', bidRoutes);

export default router;
