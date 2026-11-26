import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  categoryId?: mongoose.Types.ObjectId;
  backgroundColor: string;
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  shareSettings: {
    isShared: boolean;
    shareType: 'private' | 'public' | 'password';
    sharePassword?: string;
    shareUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: '',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    shareSettings: {
      isShared: {
        type: Boolean,
        default: false,
      },
      shareType: {
        type: String,
        enum: ['private', 'public', 'password'],
        default: 'private',
      },
      sharePassword: String,
      shareUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
NoteSchema.index({ userId: 1, isDeleted: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, categoryId: 1 });
NoteSchema.index({ userId: 1, isFavorite: 1 });
NoteSchema.index({ 'shareSettings.shareUrl': 1 });

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
