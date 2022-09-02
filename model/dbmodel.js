const mongoose = require("mongoose");
const { isEmail } = require("validator");

const Schema = mongoose.Schema;

const userScheme = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "name is required"],
    },
    email: {
        type: String,
        unique: [true, "email must be unique"],
        lowercase: true,
        required: [true, "email is required"],
        validate: [isEmail, "invalid email format"],
    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        required: [true, "password is required"],
    },
    memtype: {
        type: String,
        trim: true,
        required: [true, "member type is required"],
    },
    adoptedCats: Array,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("userprofile", userScheme);
