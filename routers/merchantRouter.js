const express = require('express')
const upload = require("../utils/multer")
const { authorize, isSuperAdmin} = require(`../middlewares/Auth`)
const { signUp, userLogin, verifyEmail, resendVerificationEmail, forgotPassword, changePassword, resetPassword, getAllMerchants, updateMerchant, getOneMerchant, merchantLogOut, deleteMerchant } = require('../controllers/merchantController')
const midasValidator = require('../middlewares/validator')
const { getMerchantOrders } = require('../controllers/orderController')
const router = express.Router()

router.post('/merchant-signup', midasValidator(false), signUp)

router.post(`/merchant-login`, midasValidator(false), userLogin)

router.get(`/merchant-verify/:token`, verifyEmail)

router.post(`/merchant-resendverification`, midasValidator(false), resendVerificationEmail)

router.post(`/merchant-forgotpassword`, midasValidator(false), forgotPassword)

router.post(`/merchant-changepassword/:token`, midasValidator(false), changePassword)

router.post(`/merchant-reset-password/:token`, midasValidator(false), resetPassword)

router.put('/merchant-updateinfo/:merchantId', midasValidator(false), authorize, updateMerchant)

router.get(`/merchant-getone/:merchantId`, getOneMerchant)

router.get(`/orders-received`, authorize, getMerchantOrders)

router.get(`/merchant-getall`, getAllMerchants)

router.post(`/merchant-logout`, merchantLogOut)

router.delete('/merchant/:merchantId', isSuperAdmin, deleteMerchant)

module.exports = router