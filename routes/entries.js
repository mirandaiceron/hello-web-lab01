import { Router } from 'express';
import * as entriesController from '../controllers/entriesController.js';
import { requireLogin } from '../middleware/requireLogin.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', entriesController.index);
router.post('/', requireLogin, entriesController.create);
router.post('/classic', requireLogin, entriesController.createClassic);
router.put('/:id', requireLogin, entriesController.update);
router.patch('/:id/favorite', requireLogin, entriesController.toggleFavorite);
router.delete('/:id', requireLogin, entriesController.destroy);
router.get('/admin/entries', requireAdmin, entriesController.adminEntries);

export default router;