import mongoose from 'mongoose';

const CATEGORY = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];
const STATUS = ['pending', 'in-progress', 'completed'];
const PRIORITY = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [100, 'title must be 100 chars or fewer'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: { values: STATUS, message: 'status must be pending|in-progress|completed' },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: { values: PRIORITY, message: 'priority must be low|medium|high' },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'dueDate is required (YYYY-MM-DD)'],
    },
    category: {
      type: String,
      enum: { values: CATEGORY, message: 'category must be Work|Personal|Shopping|Health|Other' },
      required: [true, 'category is required'],
    },
  },
  { timestamps: true }
);

// standardize JSON output
taskSchema.set('toJSON', {
  versionKey: false, // removes __v
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

// for completeness, mirror for toObject if you ever use it
taskSchema.set('toObject', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

// helpful indexes
taskSchema.index({ createdAt: -1 });
taskSchema.index({ dueDate: 1 });
export default mongoose.model('Task', taskSchema);
