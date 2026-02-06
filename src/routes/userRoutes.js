const express = require("express");
const { addStudentCtrl } = require("../controllers/userController");
const { verifyTokenAndOnlyAdmin } = require("../middlewares/verifyToken");
const router = express.Router();

// /api/users/add-student
router.route("/add-student")
    .post(verifyTokenAndOnlyAdmin, addStudentCtrl);

module.exports = router;
