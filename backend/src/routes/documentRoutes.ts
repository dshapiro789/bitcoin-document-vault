import express from 'express';
import { authenticateUser } from '../controllers/authController';
import { FileController } from '../controllers/fileController';

const router = express.Router();

router.use(authenticateUser);

router.get('/', FileController.getFiles);
router.post('/', FileController.uploadFile);
router.delete('/:id', FileController.deleteFile);
router.put('/:id/category', FileController.updateCategory);
router.get('/:id/download', FileController.downloadFile);
router.get('/:id/preview', FileController.previewFile);
router.post('/bulk-delete', FileController.bulkDelete);
router.post('/bulk-update-category', FileController.bulkUpdateCategory);

export default router;