// src/middleware/errors.js
import mongoose from 'mongoose';

export function notFound(_req, res, _next) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, _req, res, _next) {
  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }

  // CastError: invalid ObjectId
  if (err instanceof mongoose.Error.CastError && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid id format' });
  }

  // Duplicate key, etc.
  if (err.code && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', key: err.keyValue });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
}
