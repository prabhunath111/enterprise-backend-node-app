import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { ApiResponse } from '../utils/response';

export class CourseController {
  // ============= GET ALL COURSES =============
  static async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const level = req.query.level as string;
      const instructor = req.query.instructor as string;

      const result = await CourseService.getAllCourses(
        page,
        limit,
        category,
        search,
        level,
        instructor
      );
      ApiResponse.success(res, result, 'Courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET SINGLE COURSE =============
  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(id);
      ApiResponse.success(res, course, 'Course retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET POPULAR COURSES =============
  static async getPopularCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const courses = await CourseService.getPopularCourses(limit);
      ApiResponse.success(res, courses, 'Popular courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET COURSES BY CATEGORY =============
  static async getCoursesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const courses = await CourseService.getCoursesByCategory(category);
      ApiResponse.success(res, courses, 'Courses by category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= SEARCH COURSES =============
  static async searchCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) {
        throw new Error('Search query is required');
      }
      const courses = await CourseService.searchCourses(q as string);
      ApiResponse.success(res, courses, 'Search results retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= ENROLL IN COURSE =============
  static async enrollInCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const { courseId } = req.params;
      const result = await CourseService.enrollInCourse(userId, courseId);
      ApiResponse.success(res, result, 'Enrolled successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET ENROLLED COURSES =============
  static async getEnrolledCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const courses = await CourseService.getEnrolledCourses(userId);
      ApiResponse.success(res, courses, 'Enrolled courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET COURSE PROGRESS =============
  static async getCourseProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const { courseId } = req.params;
      const progress = await CourseService.getCourseProgress(userId, courseId);
      ApiResponse.success(res, progress, 'Course progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= UPDATE COURSE PROGRESS =============
  static async updateCourseProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const { courseId } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      await CourseService.updateCourseProgress(userId, courseId, progress);
      ApiResponse.success(res, null, 'Course progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= GET COURSE STATS =============
  static async getCourseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const stats = await CourseService.getCourseStats(courseId);
      ApiResponse.success(res, stats, 'Course stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= CREATE COURSE (INSTRUCTOR) =============
  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req as any).user._id;
      const courseData = req.body;
      const course = await CourseService.createCourse(instructorId, courseData);
      ApiResponse.success(res, course, 'Course created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // ============= UPDATE COURSE (INSTRUCTOR) =============
  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req as any).user._id;
      const { courseId } = req.params;
      const courseData = req.body;
      const course = await CourseService.updateCourse(courseId, instructorId, courseData);
      ApiResponse.success(res, course, 'Course updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============= DELETE COURSE (INSTRUCTOR) =============
  static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req as any).user._id;
      const { courseId } = req.params;
      await CourseService.deleteCourse(courseId, instructorId);
      ApiResponse.success(res, null, 'Course deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}