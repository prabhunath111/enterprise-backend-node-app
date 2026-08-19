import mongoose from 'mongoose';
import { Course } from './models/Course.model';
import { User } from './models/User.model';
import { env } from './config/env';
import logger from './utils/logger';

const seedCourses = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // Find an instructor
    const instructor = await User.findOne({ roles: 'instructor' });
    if (!instructor) {
      logger.warn('No instructor found. Please create an instructor first.');
      return;
    }

    // Sample courses
    const courses = [
      {
        title: 'Complete JavaScript Masterclass',
        description: 'Learn JavaScript from beginner to advanced with real-world projects',
        instructor: instructor._id,
        category: 'Programming',
        level: 'beginner',
        price: 99.99,
        imageUrl: 'https://example.com/js-course.jpg',
        tags: ['JavaScript', 'Web Development', 'Programming'],
        whatYouWillLearn: [
          'Master JavaScript fundamentals',
          'Build real-world applications',
          'Understand advanced concepts like closures and promises',
          'Work with APIs and async programming'
        ],
        prerequisites: ['Basic HTML & CSS knowledge'],
        lessons: [
          {
            title: 'Introduction to JavaScript',
            description: 'Get started with JavaScript basics',
            duration: 30,
            videoUrl: 'https://example.com/videos/js-intro',
            order: 1,
            isFree: true
          },
          {
            title: 'Variables and Data Types',
            description: 'Understanding variables, strings, numbers, and more',
            duration: 45,
            videoUrl: 'https://example.com/variables',
            order: 2
          }
        ],
        isPublished: true
      },
      {
        title: 'React Native Mobile App Development',
        description: 'Build cross-platform mobile apps with React Native',
        instructor: instructor._id,
        category: 'Mobile Development',
        level: 'intermediate',
        price: 149.99,
        imageUrl: 'https://example.com/react-native-course.jpg',
        tags: ['React Native', 'Mobile', 'iOS', 'Android'],
        whatYouWillLearn: [
          'Build production-ready mobile apps',
          'Understand React Native architecture',
          'Work with native modules',
          'Deploy to App Store and Google Play'
        ],
        prerequisites: ['JavaScript knowledge', 'React basics'],
        lessons: [
          {
            title: 'Setting Up React Native',
            description: 'Install and configure React Native development environment',
            duration: 40,
            videoUrl: 'https://example.com/rn-setup',
            order: 1,
            isFree: true
          }
        ],
        isPublished: true
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming for data analysis and machine learning',
        instructor: instructor._id,
        category: 'Data Science',
        level: 'beginner',
        price: 129.99,
        imageUrl: 'https://example.com/python-course.jpg',
        tags: ['Python', 'Data Science', 'Machine Learning'],
        whatYouWillLearn: [
          'Master Python programming',
          'Work with pandas, numpy, and matplotlib',
          'Build machine learning models',
          'Analyze real datasets'
        ],
        prerequisites: ['Basic programming knowledge'],
        lessons: [
          {
            title: 'Python Basics',
            description: 'Getting started with Python programming',
            duration: 35,
            videoUrl: 'https://example.com/python-basics',
            order: 1,
            isFree: true
          }
        ],
        isPublished: true
      }
    ];

    // Insert courses
    for (const course of courses) {
      const existing = await Course.findOne({ title: course.title });
      if (!existing) {
        await Course.create(course);
        logger.info(`Seeded course: ${course.title}`);
      } else {
        logger.info(`Course already exists: ${course.title}`);
      }
    }

    logger.info('Course seeding completed!');
  } catch (error) {
    logger.error('Error seeding courses:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seed
seedCourses();