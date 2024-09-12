import express from 'express';
import { createCourse } from '../controllers/course.controller.js';

const router = express.Router();

// POST route for creating a new course
router.post('/create', createCourse);

export default router;