import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ============= PUBLIC ROUTES =============
// GET all courses (with pagination, filtering, search)
router.get('/', CourseController.getAllCourses);

// GET popular courses
router.get('/popular', CourseController.getPopularCourses);

// GET courses by category
router.get('/category/:category', CourseController.getCoursesByCategory);

// GET search courses
router.get('/search', CourseController.searchCourses);

// GET single course
router.get('/:id', CourseController.getCourseById);

// GET course stats
router.get('/:courseId/stats', CourseController.getCourseStats);

// ============= PROTECTED ROUTES (Authenticated users) =============
// POST enroll in course
router.post('/:courseId/enroll', authenticate, CourseController.enrollInCourse);

// GET enrolled courses
router.get('/enrolled/me', authenticate, CourseController.getEnrolledCourses);

// GET course progress
router.get('/:courseId/progress', authenticate, CourseController.getCourseProgress);

// PUT update course progress
router.put('/:courseId/progress', authenticate, CourseController.updateCourseProgress);

// ============= INSTRUCTOR ROUTES =============
// POST create course (instructor only)
router.post('/', authenticate, authorize('instructor', 'admin'), CourseController.createCourse);

// PUT update course (instructor only)
router.put('/:courseId', authenticate, authorize('instructor', 'admin'), CourseController.updateCourse);

// DELETE course (instructor only)
router.delete('/:courseId', authenticate, authorize('instructor', 'admin'), CourseController.deleteCourse);

export default router;