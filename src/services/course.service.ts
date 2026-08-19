import { Course, ICourse } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { ApiError } from '../utils/response';
import logger from '../utils/logger';

export class CourseService {
  // ============= GET ALL COURSES =============
  static async getAllCourses(
    page: number = 1,
    limit: number = 20,
    category?: string,
    search?: string,
    level?: string,
    instructor?: string
  ): Promise<{ courses: ICourse[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const filter: any = { isPublished: true };
    
    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (instructor) {
      filter.instructor = instructor;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    return {
      courses: courses as ICourse[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============= GET SINGLE COURSE =============
  static async getCourseById(courseId: string): Promise<ICourse> {
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email avatarUrl');

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    return course as ICourse;
  }

  // ============= GET POPULAR COURSES =============
  static async getPopularCourses(limit: number = 10): Promise<ICourse[]> {
    const courses = await Course.find({ isPublished: true })
      .sort({ students: -1, rating: -1 })
      .limit(limit)
      .populate('instructor', 'name email avatarUrl');

    return courses as ICourse[];
  }

  // ============= GET COURSES BY CATEGORY =============
  static async getCoursesByCategory(category: string): Promise<ICourse[]> {
    const courses = await Course.find({ category, isPublished: true })
      .populate('instructor', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    return courses as ICourse[];
  }

  // ============= SEARCH COURSES =============
  static async searchCourses(query: string): Promise<ICourse[]> {
    const courses = await Course.find(
      {
        $text: { $search: query },
        isPublished: true,
      },
      {
        score: { $meta: 'textScore' },
      }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('instructor', 'name email avatarUrl')
      .limit(20);

    return courses as ICourse[];
  }

  // ============= ENROLL IN COURSE =============
  static async enrollInCourse(userId: string, courseId: string): Promise<{ success: boolean }> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      throw new ApiError(400, 'Already enrolled in this course');
    }

    await Enrollment.create({
      user: userId,
      course: courseId,
    });

    // Increment student count
    course.students += 1;
    await course.save();

    logger.info(`User ${userId} enrolled in course ${courseId}`);
    return { success: true };
  }

  // ============= GET ENROLLED COURSES =============
  static async getEnrolledCourses(userId: string): Promise<ICourse[]> {
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name email avatarUrl',
        },
      })
      .sort({ enrolledAt: -1 });

    // Extract courses from enrollments and filter out null values
    const courses = enrollments
      .map(enrollment => (enrollment as any).course)
      .filter(course => course !== null);

    return courses as ICourse[];
  }

  // ============= GET COURSE PROGRESS =============
  static async getCourseProgress(userId: string, courseId: string): Promise<{ progress: number; isCompleted: boolean }> {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    return { 
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted 
    };
  }

  // ============= UPDATE COURSE PROGRESS =============
  static async updateCourseProgress(
    userId: string,
    courseId: string,
    progress: number
  ): Promise<void> {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    enrollment.progress = Math.min(progress, 100);
    enrollment.lastAccessed = new Date();

    if (progress >= 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    logger.info(`Course progress updated: ${userId} - ${courseId}: ${progress}%`);
  }

  // ============= CREATE COURSE (INSTRUCTOR) =============
  static async createCourse(
    instructorId: string,
    courseData: Partial<ICourse>
  ): Promise<ICourse> {
    const course = new Course({
      ...courseData,
      instructor: instructorId,
    });

    await course.save();
    logger.info(`Course created by ${instructorId}: ${course.title}`);
    return course as ICourse;
  }

  // ============= UPDATE COURSE (INSTRUCTOR) =============
  static async updateCourse(
    courseId: string,
    instructorId: string,
    courseData: Partial<ICourse>
  ): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (course.instructor.toString() !== instructorId) {
      throw new ApiError(403, 'Not authorized to update this course');
    }

    Object.assign(course, courseData);
    await course.save();
    logger.info(`Course updated: ${courseId}`);
    return course as ICourse;
  }

  // ============= DELETE COURSE (INSTRUCTOR) =============
  static async deleteCourse(courseId: string, instructorId: string): Promise<void> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (course.instructor.toString() !== instructorId) {
      throw new ApiError(403, 'Not authorized to delete this course');
    }

    // Delete all enrollments
    await Enrollment.deleteMany({ course: courseId });
    
    // Delete course
    await course.deleteOne();
    logger.info(`Course deleted: ${courseId}`);
  }

  // ============= GET COURSE STATS =============
  static async getCourseStats(courseId: string): Promise<any> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const totalEnrollments = await Enrollment.countDocuments({ course: courseId });
    const completedEnrollments = await Enrollment.countDocuments({ 
      course: courseId, 
      isCompleted: true 
    });

    return {
      totalStudents: course.students,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 
        ? (completedEnrollments / totalEnrollments) * 100 
        : 0,
      rating: course.rating,
      totalLessons: course.lessons.length,
    };
  }
}