const expressAsyncHandler = require("express-async-handler");
const { Test, validateCreateTest, validateUpdateTest, validateAddQuestion } = require("../models/Test");
const { Level } = require("../models/Level");

/**
 * @route   POST /api/tests
 * @desc    Create a new test
 * @access  Private (Only Admin)
 */
module.exports.createTestCtrl = expressAsyncHandler(async (req, res) => {
    const { error } = validateCreateTest(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { levelId, questions } = req.body; // استخراج الأسئلة

    const level = await Level.findById(levelId);
    if (!level) return res.status(404).json({ message: "Level not found" });

    const test = await Test.create({
        title: req.body.title,
        description: req.body.description,
        level: levelId,
        questions: questions || [] 
    });

    level.tests.push(test._id);
    await level.save();

    res.status(201).json(test);
});


/**
 * @route   POST /api/tests/:id/questions
 * @desc    Add a question to an existing test
 * @access  Private (Only Admin)
 */
module.exports.addQuestionToTestCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate the question body
    const { error } = validateAddQuestion(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // 2. Validate correctOptionIndex logic (must be within options range)
    const { options, correctOptionIndex } = req.body;
    if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
        return res.status(400).json({ message: "Invalid correctOptionIndex. It must be within the options range." });
    }

    // 3. Find the test
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // 4. Add the question
    test.questions.push(req.body);
    await test.save();

    res.status(200).json(test);
});


/**
 * @route   GET /api/tests
 * @desc    Get all tests (can be filtered by levelId)
 * @access  Private (Logged-in users)
 */
module.exports.getAllTestsCtrl = expressAsyncHandler(async (req, res) => {
    const { levelId } = req.query; // Filter by levelId if provided in query string
    const filter = levelId ? { level: levelId } : {};

    const tests = await Test.find(filter).select("-questions -level");
    res.status(200).json(tests);
});

/**
 * @route   GET /api/tests/:id
 * @desc    Get a single test by its ID
 * @access  Private (Logged-in users)
 */
module.exports.getTestByIdCtrl = expressAsyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id).populate('level', 'name');
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.status(200).json(test);
});

/**
 * @route   PUT /api/tests/:id
 * @desc    Update a test
 * @access  Private (Only Admin)
 */
module.exports.updateTestCtrl = expressAsyncHandler(async (req, res) => {
    const { error } = validateUpdateTest(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedTest = await Test.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description
        }
    }, { new: true });

    if (!updatedTest) return res.status(404).json({ message: "Test not found" });
    res.status(200).json(updatedTest);
});

/**
 * @route   DELETE /api/tests/:id
 * @desc    Delete a single test
 * @access  Private (Only Admin)
 */
module.exports.deleteTestCtrl = expressAsyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    await Level.findByIdAndUpdate(test.level, { $pull: { tests: test._id } });
    await Test.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Test has been deleted successfully" });
});
