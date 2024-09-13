const mongoose = require('mongoose')

const mSchema = new mongoose.Schema({
    businessName: {
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
        type: String,
        require: true
    },
    description: {
    type: String
    },
    profileImage: {
    type: String
    },
    isVerified:{
        type:String,
        default: false
    },
    isAdmin:{
        type:String,
        default: true
    },
    products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    blackList:[]
}, {timestamps: true})

// Add case-insensitive index to the email field
mSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 1 } });

const merchantModel = mongoose.model('Merchant', mSchema);

module.exports = merchantModel