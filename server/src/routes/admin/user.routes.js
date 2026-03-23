import express from 'express';
import * as userController from '../../controllers/admin/user.controller.js';
import upgradeRequestRoutes from './upgrade_request.routes.js';

const router = express.Router();

router.get('/list', userController.getUserList);
router.get('/total-page', userController.getTotalPage);
router.get('/:id', userController.getUserDetail);
router.put('/:id', userController.updateUser);
router.post('/create', userController.createUser);
router.delete('/delete/:id', userController.deleteUser);
router.delete('/delete-list', userController.deleteUserList);
router.post('/reset-password/:id', userController.resetPassword);

router.use('/upgrade-requests', upgradeRequestRoutes);

export default router;
