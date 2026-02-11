const mongoose = require("mongoose");
const joi = require("joi");


// بنية الدرس (مضمنة)
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link : { type: String, required: true},
    order: { type: Number, default: 0 },
    description : {type: String , required : true},
    content: { type: String, required: true }, // يمكن أن يحتوي على HTML
    
});

// بنية المستوى الرئيسية
const levelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // رابط أو مسار الصورة
        default: null
    },
    order: {
        type: Number, // لترتيب المستويات
        default: 0
    },
    // ربط بالمستوى السابق كشرط أساسي
    prerequisiteLevelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level',
        default: null
    },
    lessons: {
       type: [lessonSchema],
       default: []
    
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test' // يشير إلى مودل 'Test'
    }]
}, {
    timestamps: true
});

const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);

// Validation for creating a new level
function validateCreateLevel(obj) {
    const schema = joi.object({
        name: joi.string().trim().min(3).max(200).required(),
        description: joi.string().trim().required(),
        image: joi.string().trim(),
        order: joi.number(),
        prerequisiteLevelId: joi.string().hex().length(24) // للتحقق من صحة ObjectId
    });
    return schema.validate(obj);
}

// Validation for updating a level
function validateUpdateLevel(obj) {
    const schema = joi.object({
        name: joi.string().trim().min(3).max(200),
        description: joi.string().trim(),
        image: joi.string().trim(),
        order: joi.number(),
        prerequisiteLevelId: joi.string().hex().length(24)
    });
    return schema.validate(obj);
}


// Validation for adding a new lesson
function validateAddLesson(obj) {
    const schema = joi.object({
        title: joi.string().trim().min(3).required(),
        link: joi.string().trim().required(),
        description: joi.string().trim().required(),
        content: joi.string().trim().required(),
        order: joi.number()
    });
    return schema.validate(obj);
}

// Validation for updating an existing lesson
function validateUpdateLesson(obj) {
    const schema = joi.object({
        title: joi.string().trim().min(3),
         link: joi.string().trim(),
        description: joi.string().trim(),
        content: joi.string().trim(),
        order: joi.number()
    });
    return schema.validate(obj);
}

module.exports = {
    Level,
    validateCreateLevel,
    validateUpdateLevel,
    validateAddLesson,    
    validateUpdateLesson  
};
