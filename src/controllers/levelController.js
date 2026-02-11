const expressAsyncHandler = require("express-async-handler");
const { link } = require("joi");
const { Level } = require("../models/Level.JS");
const { validateCreateLevel } = require("../models/Level.JS");
const { validateUpdateLevel } = require("../models/Level.JS");
const { validateAddLesson } = require("../models/Level.JS");
const { validateUpdateLesson } = require("../models/Level.JS");
const cloudinary = require('cloudinary').v2; 

/**
 * @route   POST /api/levels
 * @desc    Create a new level
 * @access  Private (Only Admin)
 */
module.exports.createLevelCtrl = expressAsyncHandler(async (req, res) => {
    // 1. التحقق من المدخلات النصية
    const { error } = validateCreateLevel(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. التحقق من وجود ملف الصورة
    if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
    }

    // 3. إنشاء المستوى الجديد مع رابط الصورة من Cloudinary
    const level = await Level.create({
        name: req.body.name,
        description: req.body.description,
        order: req.body.order,
        image: req.file.path, 
        prerequisiteLevelId: req.body.prerequisiteLevelId
    });

    // 4. إرسال الرد
    res.status(201).json(level);
});


/**
 * @route   PUT /api/levels/:id
 * @desc    Update a level
 * @access  Private (Only Admin)
 */
module.exports.updateLevelCtrl = expressAsyncHandler(async (req, res) => {
    // 1. التحقق من المدخلات
    const { error } = validateUpdateLevel(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. البحث عن المستوى في قاعدة البيانات
    const level = await Level.findById(req.params.id);
    if (!level) {
        return res.status(404).json({ message: "Level not found" });
    }

    // 3. إذا تم رفع صورة جديدة، قم بحذف الصورة القديمة من Cloudinary
    if (req.file) {
        if (level.image) {
            // استخراج public_id من رابط الصورة القديمة
            const publicId = level.image.split("/").slice(-2).join("/").split(".")[0];
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Failed to delete old image from Cloudinary:", err);
            }
        }
    }
    
    // 4. تحديث بيانات المستوى في قاعدة البيانات
    const updatedData = {
        name: req.body.name,
        description: req.body.description,
        order: req.body.order,
        prerequisiteLevelId: req.body.prerequisiteLevelId,
    };
    // أضف الصورة الجديدة فقط إذا تم رفعها
    if (req.file) {
        updatedData.image = req.file.path;
    }

    const updatedLevel = await Level.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true });

    // 5. إرسال الرد
    res.status(200).json(updatedLevel);
});


/**
 * @route   DELETE /api/levels/:id
 * @desc    Delete a level
 * @access  Private (Only Admin)
 */
module.exports.deleteLevelCtrl = expressAsyncHandler(async (req, res) => {
    // 1. البحث عن المستوى
    const level = await Level.findById(req.params.id);
    if (!level) {
        return res.status(404).json({ message: "Level not found" });
    }

    // 2. إذا كان هناك صورة، قم بحذفها من Cloudinary
    if (level.image) {
        const publicId = level.image.split("/").slice(-2).join("/").split(".")[0];
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete image from Cloudinary:", err);
        }
    }

    // 3. حذف المستوى من قاعدة البيانات
    await Level.findByIdAndDelete(req.params.id);

    // 4. إرسال رسالة تأكيد
    res.status(200).json({ message: "Level and its image have been deleted successfully" });
});


/**
 * @route   GET /api/levels
 * @desc    Get all levels
 * @access  Private (Logged-in users)
 */
module.exports.getAllLevelsCtrl = expressAsyncHandler(async (req, res) => {
    const levels = await Level.find().sort({ order: 'asc' }).populate('prerequisiteLevelId', 'name');
    res.status(200).json(levels);
});


/**
 * @route   GET /api/levels/:id
 * @desc    Get a single level by ID
 * @access  Private (Logged-in users)
 */
module.exports.getLevelByIdCtrl = expressAsyncHandler(async (req, res) => {
    const level = await Level.findById(req.params.id).populate('prerequisiteLevelId', 'name');

    if (!level) {
        return res.status(404).json({ message: "Level not found" });
    }

    res.status(200).json(level);
});


// ===============================================
//   CRUD Operations for Lessons within a Level
// ===============================================

/**
 * @route   POST /api/levels/:levelId/lessons
 * @desc    Add a new lesson to a specific level
 * @access  Private (Only Admin)
 */
module.exports.addLessonToLevelCtrl = expressAsyncHandler(async (req, res) => {
    const { error } = validateAddLesson(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ message: "Level not found" });

    const newLesson = {
        title: req.body.title,
        link : req.body.link,
        description : req.body.description,
        content: req.body.content,
        order: req.body.order
    };
    console.log(newLesson)
    level.lessons.push(newLesson);
    await level.save();

    res.status(201).json(level.lessons.slice(-1)[0]); // إرجاع الدرس الجديد الذي تم إنشاؤه
});

/**
 * @route   GET /api/levels/:levelId/lessons
 * @desc    Get all lessons from a specific level
 * @access  Private (Logged-in users)
 */
module.exports.getAllLessonsFromLevelCtrl = expressAsyncHandler(async (req, res) => {
    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ message: "Level not found" });

    res.status(200).json(level.lessons);
});

/**
 * @route   PUT /api/levels/:levelId/lessons/:lessonId
 * @desc    Update a specific lesson within a level
 * @access  Private (Only Admin)
 */
module.exports.updateLessonInLevelCtrl = expressAsyncHandler(async (req, res) => {
    const { error } = validateUpdateLesson(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ message: "Level not found" });

    const lesson = level.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found in this level" });

    // تحديث خصائص الدرس
    if (req.body.title) lesson.title = req.body.title;
    if (req.body.link) lesson.link = req.body.link;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.content) lesson.content = req.body.content;
    if (req.body.order !== undefined) lesson.order = req.body.order;
    
    await level.save();
    res.status(200).json(lesson);
});

/**
 * @route   DELETE /api/levels/:levelId/lessons/:lessonId
 * @desc    Delete a specific lesson from a level
 * @access  Private (Only Admin)
 */
module.exports.deleteLessonFromLevelCtrl = expressAsyncHandler(async (req, res) => {
    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ message: "Level not found" });

    const lesson = level.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    
    // إزالة الدرس من المصفوفة
    level.lessons.pull(req.params.lessonId);
    
    await level.save();
    res.status(200).json({ message: "Lesson has been deleted successfully" });
});


