import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Course management
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, TeacherId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               TeacherId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created
 */
export const createCourse = async (req, res) => {
    try {
        const course = await db.Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order by course ID
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Comma-separated related models to include (e.g., 'Teacher')
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 */
export const getAllCourses = async (req, res) => {

    // take certain amount at a time
    const limit = parseInt(req.query.limit) || 10;
    // which page to take
    const page = parseInt(req.query.page) || 1;

    //sort order
    const sort = req.query.sort === 'desc' ? 'DESC' : 'ASC';
const populate = req.query.populate ? req.query.populate.toLowerCase() : '';

    const total = await db.Course.count();

    try {
        const courses = await db.Course.findAll(
            {
                // include: [db.Student, db.Teacher],
                limit: limit, 
                offset: (page - 1) * limit,
                order: [['id', sort]],
                include: populate ? populate.split(',').map(model => {
                    if (model === 'teacher') return { model: db.Teacher };
                    if (model === 'student') return { model: db.Student };
                    return null;
                }).filter(Boolean) : []
            }
        );
        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
            },
            data: courses,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Not found
 */
export const getCourseById = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, { include: [db.Student, db.Teacher] });
        if (!course) return res.status(404).json({ message: 'Not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Course updated
 */
export const updateCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.update(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Course deleted
 */
export const deleteCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};