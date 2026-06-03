import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    couple_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['milestone', 'memory', 'date', 'custom'],
      default: 'custom',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast couple timeline queries sorted by date
timelineEventSchema.index({ couple_id: 1, date: -1 });

export default mongoose.model('TimelineEvent', timelineEventSchema);
