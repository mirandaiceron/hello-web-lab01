import { Router } from 'express';
import * as entriesController from '../controllers/entriesController.js';

const router = Router();

router.get('/', entriesController.index);
router.post('/', entriesController.create);
router.post('/classic', entriesController.createClassic);
router.put('/:id', entriesController.update);
router.delete('/:id', entriesController.destroy);

export default router;