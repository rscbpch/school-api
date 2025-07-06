import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers (paginated)
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of teachers per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order by teacher ID
 *       - in: query
 *         name: populate
 *         schema:
 *         type: string
 *         description: Whether to include related courses (e.g. 'course')
 *     responses:
 *       200:
 *         description: Paginated list of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 */
 /**
    * Retrieves a paginated list of teachers from the database.
    *
    * Query Parameters:
    * @param {Object} req - Express request object.
    * @param {Object} req.query - Query parameters.
    * @param {string} [req.query.limit=10] - Number of teachers per page.
    * @param {string} [req.query.page=1] - Page number.
    * @param {string} [req.query.sort='asc'] - Sort order ('asc' or 'desc') by teacher ID.
    * @param {string} [req.query.populate='false'] - Whether to include related courses.
    * @param {Object} res - Express response object.
    *
    * @returns {Promise<void>} Responds with a JSON object containing:
    *  - meta: { total, page, totalPages }
    *  - data: Array of teacher objects (optionally with courses)
    *
    * @throws {500} On database or server error, responds with error message.
    */
export const getAllTeachers = async (req, res) => {
        
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === 'desc' ? 'DESC' : 'ASC';
        const populate = req.query.populate ? req.query.populate.toLowerCase() : '';
        const total = await db.Teacher.count();

        try {
                const teachers = await db.Teacher.findAll({
                        limit: limit,
                        offset: (page -1) * limit,
                        order: [['id', sort]],
                        include: populate ? populate.split(',').map(model => {
                                if (model === 'course') return { model: db.Course };
                                return null;
                        }).filter(Boolean) : []
                 });
                res.json(
                        {
                                meta: {
                                        total: total,
                                        page: page,
                                        totalPages: Math.ceil(total / limit),
                                }
                                , data: teachers
                        }
                );
        } catch (err) {
                res.status(500).json({ error: err.message });
        }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Teacher found
 *       404:
 *         description: Not found
 */
export const getTeacherById = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id, { include: db.Course });
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};