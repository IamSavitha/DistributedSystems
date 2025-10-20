// src/routes/tasks.js
import { Router } from 'express';
import Task from '../models/Task.js';
import { asyncRoute } from '../utils/async.js';

const router = Router();

/**
 * GET /api/tasks
 *   page=1&limit=10&sort=-createdAt
 *   status=pending|in-progress|completed
 *   priority=low|medium|high
 *   category=Work|Personal|Shopping|Health|Other
 *   dueFrom=YYYY-MM-DD
 *   dueTo=YYYY-MM-DD
 *   q=free text (title/description)
 */
router.get(
  '/',
  asyncRoute(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      status,
      priority,
      category,
      dueFrom,
      dueTo,
      q,
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
      if (dueTo) filter.dueDate.$lte = new Date(dueTo);
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [items, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      items,
    });
  })
);

// POST /api/tasks
router.post(
  '/',
  asyncRoute(async (req, res) => {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  })
);

// GET /api/tasks/:id
router.get(
  '/:id',
  asyncRoute(async (req, res) => {
    const doc = await Task.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  })
);

// PUT /api/tasks/:id
router.put(
  '/:id',
  asyncRoute(async (req, res) => {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
);

// DELETE /api/tasks/:id
router.delete(
  '/:id',
  asyncRoute(async (req, res) => {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  })
);

export default router;
