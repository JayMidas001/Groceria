const express = require(`express`)
const { addToCart, viewCart, clearCart, removeItemFromCart, increaseItemQuantity, reduceItemQuantity } = require("../controllers/cartController")
const { authenticate} = require("../middlewares/Auth")
const router = express.Router()


router.post(`/addtocart`, authenticate, addToCart)

router.post(`/item-increase`, authenticate, increaseItemQuantity)

router.post(`/item-decrease`, authenticate, reduceItemQuantity)

router.get(`/viewcart`, authenticate, viewCart)

router.delete(`/removeitem`, authenticate, removeItemFromCart)

router.delete(`/clearcart`, authenticate, clearCart)

module.exports = router