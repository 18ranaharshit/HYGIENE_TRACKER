import mongoose, { Schema, Document } from 'mongoose';

/** Toilet document interface */
export interface IToilet extends Document {
  name: string;
  address: string;
  location: { type: 'Point'; coordinates: [number, number] };
  type: 'public' | 'private' | 'paid';
  isOpen: boolean;
  amenities: string[];
  hygieneScore: number;
  lastInspected?: Date;
  photos: string[];
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ToiletSchema = new Schema<IToilet>(
  {
    name:          { type: String, required: true, trim: true },
    address:       { type: String, required: true },
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    type:          { type: String, enum: ['public', 'private', 'paid'], default: 'public' },
    isOpen:        { type: Boolean, default: true },
    amenities:     { type: [String], default: [] },
    hygieneScore:  { type: Number, min: 0, max: 100, default: 50 },
    lastInspected: { type: Date },
    photos:        { type: [String], default: [] },
    addedBy:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// 2dsphere index for geospatial queries
ToiletSchema.index({ location: '2dsphere' });

export const Toilet = mongoose.model<IToilet>('Toilet', ToiletSchema);
