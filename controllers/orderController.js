onst Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const userModel = require(`../models/userModel.js`)
const merchantModel = require(`../models/merchantModel.js`)
const productModel = require(`../models/productModel.js`)
const mongoose = require(`mongoose`)
const sendMail = require(`../helpers/email.js`);
const { orderConfirmationTemplate, newOrderNotificationTemplate } = require('../helpers/html.js');

const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

const checkout = async (req, res) => {
    try {
        let userId = req.user ? req.user._id : null;
        let cart;

        // Check if the user is logged in
        if (userId) {
            // Logged-in user: find the cart associated with the user
            cart = await Cart.findOne({ user: userId }).populate('items.product');

            // If the cart is empty or undefined, return a user-friendly message
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: "Your cart is empty. Please add items to your cart before proceeding to checkout." });
            }
        } else {
            return res.status(400).json({ message: "User is not authenticated. Please log in to proceed with the checkout." });
        }

        // Filter out any deleted products (items where the product is null)
        cart.items = cart.items.filter(item => item.product !== null);

        // If all items are deleted, return an error
        if (cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart contains deleted products. Please update your cart." });
        }

        // Calculate product total amount
        let productTotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

        // Assuming a fixed delivery charge
        const deliveryCharge = 1050;

        // Calculate the total amount including the delivery charge
        const totalAmount = productTotal + deliveryCharge;

        // Save the cart after calculating the total price
        await cart.save();

        // Format the cart items and totals for the response
        const formattedCart = {
            items: cart.items.map(item => ({
                productName: item.product.productName,
                quantity: item.quantity,
                price: formatter.format(item.price),
                productImage: item.product.productImage,
            })),
        };

        res.status(200).json({
            message: "Checkout initiated",
            cart: formattedCart,
            productTotal: productTotal,
            deliveryCharge: deliveryCharge,
            totalAmount: totalAmount,
        });
    } catch (error) {
        // Catch all other errors and return a user-friendly message
        res.status(500).json({ message: "Something went wrong during checkout. Please try again later." });
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
            html: orderConfirmationTemplate(user.fullName, newOrder._id, newOrder.orderDate, newOrder.items, totalAmount, deliveryCharge),
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
        
        
        const cleanOrder = {
            user: newOrder.user,
            items: newOrder.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                productImage: item.productImage
            })),
            totalAmount: newOrder.totalAmount,
            customerFirstName: newOrder.customerFirstName,
            customerLastName: newOrder.customerLastName,
            customerAddress: newOrder.customerAddress,
            customerPhoneNumber: newOrder.customerPhoneNumber,
            city: newOrder.city,
            country: newOrder.country,
            orderStatus: newOrder.orderStatus,
            orderDate: newOrder.orderDate,
            _id: newOrder._id
        };

        res.status(201).json({
            message: "Order placed successfully",
            order: cleanOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
  
        // Find the user from the database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Find all orders for the user
        const orders = await Order.find({ _id: { $in: user.orders } })
            .sort({ orderDate: -1 })
            .populate("items");
        
        // Check if orders are empty
        if (orders.length === 0) {
            return res.status(200).json({ message: 'No orders found for this user.' });
        }
  
        // Return orders if they exist
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


  
const getMerchantOrders = async (req, res) => {
    try {
      const merchantId  = req.user ? req.user._id : null;
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
        message: error.message
      });
    }
  };

module.exports = {
    checkout,
    confirmOrder,
    getAllOrders,
    getMerchantOrders
}
