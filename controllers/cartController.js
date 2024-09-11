const Cart = require('../models/cartModel');
const productModel = require('../models/productModel');
const mongoose = require(`mongoose`)

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // Ensure user is authenticated and extract the userId from req.user
        const userId =  req.user._id; 
        
        if (!userId) {
            return res.status(400).json({ message: "User is not authenticated." });
        }

        // Ensure valid quantity is provided
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive number." });
        }

        // Find the product by its ID
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Find the user's cart, or create a new one if it doesn't exist
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,  // Ensure the user is attached to the cart
                items: [],
                totalPrice: 0,
            });
        }

        // Check if the product already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // If the product exists in the cart, update the quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // If the product doesn't exist, add it to the cart
            cart.items.push({
                product: productId,
                productName: product.productName,
                quantity,
                price: product.productPrice,
                productImage: product.productImage,
                merchant: product.merchant
            });
        }

        // Recalculate the total price of the cart
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

        // Save the cart back to the database
        await cart.save();

        res.status(200).json({
            message: "Item added to cart successfully.",
            data: cart
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const viewCart = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User is not authenticated." });
		}
		const userId = req.user._id;
		const cart = await Cart.findOne({ user: userId });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found." });
		}
		res.status(200).json({ data: cart });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


const removeItemFromCart = async (req, res) => {
	try {
		const userId = req.user._id;
		if (!userId) {
			return res.status(400).json({ message: "User is not authenticated." });
		}
		const { productId } = req.body;
		const cart = await Cart.findOne({ user: userId });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found." });
		}
		const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
		if (itemIndex === -1) {
			return res.status(404).json({ message: "Item not found in cart." });
		}
		cart.items.splice(itemIndex, 1);

		cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

		await cart.save();
		res.status(200).json({ message: "Item removed from cart successfully.", data: cart });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


const clearCart = async (req, res) => {
	try {
		const userId = req.user._id;
		if (!userId) {
			return res.status(400).json({ message: "User is not authenticated." });
		}
		const cart = await Cart.findOne({ user: userId });
		if (!cart) {
			return res.status(404).json({ message: "Cart not found." });
		}
		cart.items = [];
		cart.totalPrice = 0;
		await cart.save();
		res.status(200).json({ message: "Cart cleared successfully." });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = { addToCart, viewCart, removeItemFromCart, clearCart};
