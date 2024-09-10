const express = require(`express`)
const { authorize, authenticate} = require(`../middlewares/Auth`)
const { createProduct, getOneProduct, getAllForOneStore, getAllProducts, updateProduct, deleteProduct, searchProducts, saveProductForLater } = require("../controllers/productController")
const router = express.Router()

router.post(`/:merchantId/create-product`, authorize, createProduct)

router.get(`/getoneproduct/:productId`, getOneProduct)

router.get(`/allstoreproducts/:merchantId`, getAllForOneStore)

router.get(`/allproducts`, getAllProducts)

router.put(`/:merchantId/update-product/:productId`, authorize, updateProduct)

router.post(`/products-search`, searchProducts)

router.post(`/saveforlater`, authenticate, saveProductForLater)

router.delete(`/delete-product/:productId`, authorize, deleteProduct)

module.exports = router