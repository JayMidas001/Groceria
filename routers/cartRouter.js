const express = require(`express`)
const { addToCart, viewCart, clearCart, removeItemFromCart } = require("../controllers/cartController")
const { authenticate} = require("../middlewares/Auth")
const router = express.Router()


router.post(`/addtocart`, authenticate, addToCart)

router.get(`/viewcart`, authenticate, viewCart)

router.delete(`/removeitem`, authenticate, removeItemFromCart)

router.delete(`/clearcart`, authenticate, clearCart)

module.exports = router