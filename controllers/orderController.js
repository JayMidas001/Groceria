const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const userModel = require(`../models/userModel.js`)
const merchantModel = require(`../models/merchantModel.js`)
const productModel = require(`../models/productModel.js`)
const sendMail = require(`../helpers/email.js`);
const { orderConfirmationTemplate, newOrderNotificationTemplate } = require('../helpers/html.js');

// Utility function to initialize or retrieve a session-based cart
const getSessionCart = (req) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            totalPrice: 0
        };
    }
    return req.session.cart;
};


const checkout = async (req, res) => {
    try {
        let userId = req.user ? req.user._id : null;
        let cart;

        if (userId) {
            // Logged-in user: find the cart associated with the user
            cart = await Cart.findOne({ user: userId }).populate('items.product');

            // If the cart is empty, check if there is a session cart from the guest session
            if (!cart || cart.items.length === 0) {
                if (req.session.cart && req.session.cart.items.length > 0) {
                    // Assign the session cart to the logged-in user
                    cart = await Cart.create({
                        user: userId,
                        items: req.session.cart.items,
                    });

                }
            }
        } else {
            // Guest user: use the session cart
            cart = req.session.cart;

            // Ensure the session cart items are populated
            if (cart && cart.items.length > 0) {
                // Populate the products in session cart if not already populated
                cart = await Cart.populate(cart, { path: 'items.product' });
            }
        }

        // Check if the cart exists and has items
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Filter out deleted products (items where product is null)
        cart.items = cart.items.filter(item => item.product !== null);

        // If all items are deleted, return an error
        if (cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart contains deleted products. Please update your cart." });
        }

        // Calculate product total amount
        let productTotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)

        // Assuming a fixed delivery charge of 100
        const deliveryCharge = 1050;

        // Calculate the total amount including delivery charge
        const totalAmount = productTotal + deliveryCharge;
        await cart.calculateTotalPrice();
        await cart.save()
        res.status(200).json({
            message: "Checkout initiated",
            productTotal,
            deliveryCharge,
            totalAmount,
            cartItems: cart.items
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const confirmOrder = async (req, res) => {
    try {
        const { customerFirstName, customerLastName, customerAddress, customerPhoneNumber, city, country } = req.body;
        const userId = req.user ? req.user._id : null;

        // Ensure the user is logged in
        if (!userId) {
            return res.status(400).json({ message: 'User is not authenticated' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the cart for the logged-in user
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Populate merchant information for each item in the cart
        async function populateCartWithMerchantInfo(cart) {
            const cartItems = cart.items;
            for (let i = 0; i < cartItems.length; i++) {
                const productId = cartItems[i].product;
                const product = await productModel.findById(productId).populate('merchant');
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }
                cartItems[i].merchant = product.merchant;  // Attach the merchant to the cart item
            }
            cart.items = cartItems;
            return cart;
        }
        await populateCartWithMerchantInfo(cart);

        // Group products by merchants to avoid sending multiple emails to the same merchant
        const merchantOrders = {};
        cart.items.forEach(item => {
            const merchantId = item.merchant._id;
            if (!merchantOrders[merchantId]) {
                merchantOrders[merchantId] = {
                    merchant: item.merchant,
                    items: [],
                    total: 0
                };
            }
            merchantOrders[merchantId].items.push(item);
            merchantOrders[merchantId].total += item.quantity * item.price; // Calculate total for each merchant
        });

        // Calculate the total amount for the overall order (all products combined)
        const productTotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const deliveryCharge = 1050; // Fixed delivery charge
        const totalAmount = productTotal + deliveryCharge;

        // Create a new order
        const newOrder = await Order.create({
            user: userId,
            items: cart.items,
            totalAmount: totalAmount,
            customerFirstName: customerFirstName,
            customerLastName: customerLastName,
            customerAddress: customerAddress,
            customerPhoneNumber: customerPhoneNumber,
            city: city,
            country: country || 'Nigeria',
            orderStatus: 'Processing',
            paymentStatus: 'Paid'
        });

        // Link the order to the user
        user.orders.push(newOrder._id);
        await user.save();

        // Clear the user's cart after saving the order
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        // Send confirmation email to the user
        await sendMail({
            subject: "Order Confirmation",
            email: user.email,
            html: orderConfirmationTemplate(user.fullName, newOrder._id, newOrder.orderDate, newOrder.items, totalAmount),
        });

        // Send a separate email to each merchant with the price specific to their products
        for (const [merchantId, merchantOrder] of Object.entries(merchantOrders)) {
            const merchant = merchantOrder.merchant;
            const merchantItems = merchantOrder.items;
            const merchantTotal = merchantOrder.total;

            await sendMail({
                subject: "New Order Received",
                email: merchant.email,
                html: newOrderNotificationTemplate(
                    merchant.businessName,
                    user.fullName,
                    user.phoneNumber,
                    customerAddress,
                    newOrder._id,
                    newOrder.orderDate,
                    merchantItems,
                    merchantTotal
                ),
            });

            // Save order to the merchant's order list
            merchant.orders.push(newOrder._id);
            await merchant.save();
        }

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
      const { userId } = req.user;
  
      // Find the user from the database
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Find all orders for the user
      const orders = await Order.find({ _id: { $in: user.orders } }).sort({ orderDate: -1 }).populate("items");
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get orders',
        error: error.message
      });
    }
  };

  
const getMerchantOrders = async (req, res) => {
    try {
      const merchantId  = req.user.userId
      if (!mongoose.Types.ObjectId.isValid(merchantId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });}
      // Find the merchant from the database
      const merchant = await merchantModel.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found.' });
      }
  
      // Find all orders for the merchant
      const orders = await Order.find({ _id: { $in: merchant.orders } }).sort({ orderDate: -1 }).populate("items");
  
      res.status(200).json({message:`Orders populated suceefully.`, data: orders});
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get orders',
        error: error.message
      });
    }
  };

module.exports = {
    checkout,
    confirmOrder,
    getAllOrders,
    getMerchantOrders
}
