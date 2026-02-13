const express = require("express");
const router = express.Router(); 
const { 
    createTestCtrl, 
    getAllTestsCtrl,
    getTestByIdCtrl,
    updateTestCtrl,
    deleteTestCtrl,
    addQuestionToTestCtrl 
} = require("../controllers/testController");
const { verifyTokenAndOnlyAdmin, verifyToken } = require("../middlewares/verifyToken");

// Route: /api/tests
router.route("/")
    .post(verifyTokenAndOnlyAdmin, createTestCtrl) // Create a new test
    .get(verifyToken, getAllTestsCtrl);             // Get all tests (with optional filter)

// Route: /api/tests/:id
router.route("/:id")
    .get(verifyToken, getTestByIdCtrl)           // Get a single test
    .put(verifyTokenAndOnlyAdmin, updateTestCtrl)    // Update a test
    .delete(verifyTokenAndOnlyAdmin, deleteTestCtrl); // Delete a test


// Route: /api/tests/:id/questions
router.route("/:id/questions")
    .post(verifyTokenAndOnlyAdmin, addQuestionToTestCtrl);

module.exports = router;
