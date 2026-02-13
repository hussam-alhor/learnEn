const mongoose = require("mongoose");
const joi = require("joi");

// بنية السؤال (مضمنة داخل الاختبار)
const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true }
});

// بنية الاختبار الرئيسية
const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    description: {
        type: String,
        trim: true
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level',
        required: true
    },
    questions: [questionSchema]
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);

// Validation for creating a new Test

function validateCreateTest(obj) {
    const schema = joi.object({
        title: joi.string().trim().min(3).required(),
        description: joi.string().trim(),
        levelId: joi.string().required(), 
        
        questions: joi.array().items(joi.object({
            questionText: joi.string().required(),
            options: joi.array().items(joi.string()).min(2).required(), 
            correctOptionIndex: joi.number().min(0).required()
        })).optional()
    });
    return schema.validate(obj);
}

function validateAddQuestion(obj) {
    const schema = joi.object({
        questionText: joi.string().required(),
        options: joi.array().items(joi.string()).min(2).required(),
        correctOptionIndex: joi.number().min(0).required()
    });
    return schema.validate(obj);
}
// Validation for updating a Test
function validateUpdateTest(obj) {
    const schema = joi.object({
        title: joi.string().trim().min(3),
        description: joi.string().trim()
    });
    return schema.validate(obj);
}

module.exports = {
    Test,
    validateCreateTest,
    validateUpdateTest,
    validateAddQuestion
};
