import prisma from "../lib/prisma.js";


export const createCourse = async (req, res) => {
    const { courseId, name, description, department, credits, teacherId } = req.body;

    try {
        // Validate request body
        if (!courseId || !name || !department || !credits || !teacherId) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if the courseId already exists
        const existingCourse = await prisma.course.findUnique({
            where: { courseId },
        });

        if (existingCourse) {
            return res.status(400).json({ success: false, message: "Course with this ID already exists" });
        }

        // Check if the teacher exists
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Create a new course
        const newCourse = await prisma.course.create({
            data: {
                courseId,
                name,
                description,
                department,
                credits: parseInt(credits, 10), // Ensure credits is an integer
                teacher: {
                    connect: { id: teacherId }, // Assign the teacher to the course
                },
            },
        });
        console.log(newCourse)

        // Respond with the created course
        res.status(201).json({ success: true, course: newCourse });

    } catch (error) {
        console.error("Error creating course:", error.message);
        res.status(500).json({ success: false, message: `Failed to create course: ${error.message}` });
    }
};