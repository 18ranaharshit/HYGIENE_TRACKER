import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  toiletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  cleanliness: number;
  accessibility: number;
  facilities: number;
  comment: string;
  photos: string[];
  helpful: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    toiletId:      { type: Schema.Types.ObjectId, ref: 'Toilet', required: true },
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cleanliness:   { type: Number, min: 1, max: 5, required: true },
    accessibility: { type: Number, min: 1, max: 5, required: true },
    facilities:    { type: Number, min: 1, max: 5, required: true },
    comment:       { type: String, default: '' },
    photos:        { type: [String], default: [] },
    helpful:       { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true },
);

// One rating per user per toilet
RatingSchema.index({ toiletId: 1, userId: 1 }, { unique: true });

export const Rating = mongoose.model<IRating>('Rating', RatingSchema);
