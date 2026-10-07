import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    type: {
      type: String,
      default: 'Full-time',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    salary: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
