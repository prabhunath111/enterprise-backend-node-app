import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  duration: number; // in minutes
  videoUrl: string;
  thumbnailUrl?: string;
  order: number;
  isFree?: boolean;
  content?: string;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  category: string;
  subcategory?: string;
  rating: number;
  students: number;
  duration: number; // total hours
  imageUrl: string;
  tags: string[];
  lessons: ILesson[];
  price: number;
  isPublished: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  whatYouWillLearn: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Lesson description is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Lesson duration is required'],
      min: 1,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    subcategory: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    students: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    lessons: [LessonSchema],
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add text search index
CourseSchema.index(
  { title: 'text', description: 'text', category: 'text' },
  { weights: { title: 10, category: 5, description: 1 } }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);