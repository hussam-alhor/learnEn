const expressAsyncHandler = require("express-async-handler");
const { User, validationRegisterUser } = require("../models/User");

/**
 * @route   POST /api/users/add-student
 * @desc    Add a new student (by Admin)
 * @access  Private (Only Admin)
 */
module.exports.addStudentCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate user input
    const { error } = validationRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Create a new user (student)
    user = await User.create({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
    });

    // 4. Send response
    res.status(201).json({
        id: user._id,
        userName: user.userName,
        email: user.email,
        message: "Student account created successfully.",
    });
});
