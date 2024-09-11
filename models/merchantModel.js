const mongoose = require('mongoose')

const mSchema = new mongoose.Schema({
    businessName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
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
        type:String
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

const merchantModel = mongoose.model('Merchant', mSchema);

module.exports = merchantModel