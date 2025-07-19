import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  createRequest,
  getAllRequests,
  getSingleRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest
} from '../controllers/requestController.js';

import { authenticateToken } from '../middleware/authMiddleware.js'; // ✅

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

/* 📦 Protected Routes */
router.post('/', authenticateToken, upload.single('attachment'), createRequest);
router.get('/', authenticateToken, getAllRequests);
router.get('/:id', authenticateToken, getSingleRequest);
router.patch('/:id', authenticateToken, upload.single('attachment'), updateRequest);
router.patch('/:id/status', authenticateToken, updateRequestStatus);
router.delete('/:id', authenticateToken, deleteRequest);

export default router;
