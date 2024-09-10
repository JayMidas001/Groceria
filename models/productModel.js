const mongoose = require(`mongoose`)

const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        require: true
    },
    productPrice:{
        type: String,
        require: true
    },
    productDescription:{
        type: String,
        require: true
    },
    productImage:{
        type: String,
    },
    productCategory:{
        type: String,
    },
    email:{
        type: String,
    },
    merchant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant"
    }
}, {timestamps:true})

const productModel = mongoose.model(`Product`, productSchema)

module.exports = productModel
