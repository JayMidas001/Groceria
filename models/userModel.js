const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true, // Store emails in lowercase
        trim: true, // Removes spaces before or after the email
    },
    password: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    address: {
        type: String
    },
    isVerified:{
        type:String
    },
    isAdmin:{
        type:String
    },
    isSuperAdmin:{
        type:String
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    savedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    blackList:[]
}, {timestamps: true})

// Add case-insensitive index to the email field
userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 1 } });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel