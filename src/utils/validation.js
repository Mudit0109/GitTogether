// utils/validation.js
const validator = require('validator');
// Check required fields
function validateSignupData({ firstname, email, password }) {
    const errors = [];

    if (!firstname || !email || !password ) {
        errors.push("All required fields must be filled");
    }

    if (password && password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }


    const emailRegex = /\S+@\S+\.\S+/;
    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
function validateEditProfileData(data) {
    const allowedEditFields = ['age', 'gender', 'photoUrl', 'skills', 'about'];
    const errors = [];

   Object.keys(data).forEach(key => {
        if (!allowedEditFields.includes(key)) {
            errors.push(`Invalid field: ${key}`);
        }
    });

    if (data.age && (data.age < 18 || data.age > 150)) {
        errors.push("Age must be between 18 and 150");
    }
    if (data.gender && !["male", "female", "other"].includes(data.gender.toLowerCase())) {
        errors.push("Gender must be male, female, or other");
    }
    if (data.photoUrl && !validator.isURL(data.photoUrl)) {
        errors.push("Invalid photo URL");
    }
    if (data.skills && !Array.isArray(data.skills) ) {
        errors.push("Skills must be an array");
    }
    if (data.skills && data.skills.length > 10) {
        errors.push("Skills cannot exceed 10 items");
    }
    if (data.about && data.about.length > 500) {
        errors.push("About section cannot exceed 500 characters");
    }
    if (data.about && typeof data.about !== "string") {
        errors.push("About must be a string");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
function validateEditPassword({ password }) {
    const errors = [];

    if (!password) {
        errors.push("Password is required");
    } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

module.exports = {
    validateSignupData,
    validateEditProfileData,
    validateEditPassword
};
