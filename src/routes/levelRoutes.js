const express = require("express");
const {
    createLevelCtrl,
    getAllLevelsCtrl,
    getLevelByIdCtrl,
    updateLevelCtrl,
    deleteLevelCtrl,

    addLessonToLevelCtrl,
    getAllLessonsFromLevelCtrl,
    updateLessonInLevelCtrl,
    deleteLessonFromLevelCtrl
} = require("../controllers/levelController");
const { verifyToken, verifyTokenAndOnlyAdmin } = require("../middlewares/verifyToken");
const upload = require("../middlewares/uploadImage");
const router = express.Router();

// =======================
//   Level Routes
// =======================
router.route("/")
    .post(verifyTokenAndOnlyAdmin, upload.single('image'), createLevelCtrl)
    .get(verifyToken, getAllLevelsCtrl);

router.route("/:id")
    .get(verifyToken, getLevelByIdCtrl)
    .put(verifyTokenAndOnlyAdmin, upload.single('image'), updateLevelCtrl)
    .delete(verifyTokenAndOnlyAdmin, deleteLevelCtrl);



// =======================
//   Lesson Routes within a Level
// =======================

//  /api/levels/:levelId/lessons
router.route("/:levelId/lessons")
    .post(verifyTokenAndOnlyAdmin, addLessonToLevelCtrl) // إضافة درس
    .get(verifyToken, getAllLessonsFromLevelCtrl); // جلب كل الدروس

//  /api/levels/:levelId/lessons/:lessonId
router.route("/:levelId/lessons/:lessonId")
    .put(verifyTokenAndOnlyAdmin, updateLessonInLevelCtrl) // تحديث درس
    .delete(verifyTokenAndOnlyAdmin, deleteLessonFromLevelCtrl); // حذف درس

module.exports = router;
