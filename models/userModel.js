const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
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

const userModel = mongoose.model('User', userSchema);

module.exports = userModel