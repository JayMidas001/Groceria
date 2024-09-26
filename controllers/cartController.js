// const Cart = require('../models/cartModel');
// const productModel = require('../models/productModel');
// const mongoose = require(`mongoose`)

// const formatter = new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: 2
//   });

// const addToCart = async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;
        
//         // Ensure user is authenticated and extract the userId from req.user
//         const userId =  req.user._id; 
        
//         if (!userId) {
//             return res.status(400).json({ message: "User is not authenticated." });
//         }

//         // Ensure valid quantity is provided
//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({ message: "Quantity must be a positive number." });
//         }

//         // Find the product by its ID
//         const product = await productModel.findById(productId);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found." });
//         }

//         // Find the user's cart, or create a new one if it doesn't exist
//         let cart = await Cart.findOne({ user: userId })
//         if (!cart) {
//             cart = new Cart({
//                 user: userId,  // Ensure the user is attached to the cart
//                 items: [],
//                 totalPrice: 0,
//             });
//         }

//         // Check if the product already exists in the cart
//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

//         if (itemIndex > -1) {
//             // If the product exists in the cart, update the quantity
//             cart.items[itemIndex].quantity += quantity;
//         } else {
//             // If the product doesn't exist, add it to the cart
//             cart.items.push({
//                 product: productId,
//                 productName: product.productName,
//                 quantity,
//                 price: product.productPrice,
//                 productImage: product.productImage,
//                 merchant: product.merchant
//             });
//         }

//         // Recalculate the total price of the cart
//         cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

//         // Save the cart back to the database
//         await cart.save();
//         const formattedCart = {
//             data: {
//               items: cart.items.map(item => ({
//                 productId: item.product, // replace product with productId for clarity
//                 productName: item.productName,
//                 quantity: item.quantity,
//                 price: formatter.format(item.price),
//                 productImage: item.productImage,
//               })),
//               totalPrice: formatter.format(cart.totalPrice),
//             },
//           };

//         res.status(200).json({
//             message: "Item added to cart successfully.",
//             data: formattedCart  // Send formatted prices
//         });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }

// };

// const viewCart = async (req, res) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({ message: "User is not authenticated." });
//       }
//       const userId = req.user._id;
//       const cart = await Cart.findOne({ user: userId });
  
//       if (!cart) {
//         return res.status(404).json({ message: "Cart not found." });
//       }
  
//       const formattedCart = {
//         data: {
//           items: cart.items.map(item => ({
//             productId: item.product, // replace product with productId for clarity
//             productName: item.productName,
//             quantity: item.quantity,
//             price: item.price,
//             productImage: item.productImage,
//           })),
//           totalPrice: cart.totalPrice,
//         },
//       };
//       res.status(200).json({ data: formattedCart });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   const increaseItemQuantity = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         if (!userId) {
//             return res.status(400).json({ message: "User is not authenticated." });
//         }

//         const { productId } = req.body; // We only need the productId now
//         if (!productId) {
//             return res.status(400).json({ message: "Product ID is required." });
//         }

//         const cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found." });
//         }

//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ message: "Item not found in cart." });
//         }

//         // Increase the item quantity by 1
//         cart.items[itemIndex].quantity += 1;

//         // Recalculate the total price
//         cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

//         await cart.save();

//         const formattedCart = {
//             data: {
//                 items: cart.items.map(item => ({
//                     productId: item.product,
//                     productName: item.productName,
//                     quantity: item.quantity,
//                     price: formatter.format(item.price),
//                     productImage: item.productImage,
//                 })),
//                 totalPrice: formatter.format(cart.totalPrice),
//             },
//         };

//         res.status(200).json({ message: "Item quantity increased successfully.", data: formattedCart });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const reduceItemQuantity = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         if (!userId) {
//             return res.status(400).json({ message: "User is not authenticated." });
//         }
  
//         const { productId } = req.body; // Only productId is needed
//         if (!productId) {
//             return res.status(400).json({ message: "Product ID is required." });
//         }
  
//         const cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found." });
//         }
  
//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ message: "Item not found in cart." });
//         }
  
//         // Reduce the item quantity by 1
//         cart.items[itemIndex].quantity -= 1;
  
//         // If the quantity reaches 0 or below, remove the item from the cart
//         if (cart.items[itemIndex].quantity <= 0) {
//             cart.items.splice(itemIndex, 1);
//         }
  
//         // Recalculate the total price
//         cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  
//         await cart.save();
  
//         const formattedCart = {
//             data: {
//                 items: cart.items.map(item => ({
//                     productId: item.product,
//                     productName: item.productName,
//                     quantity: item.quantity,
//                     price: formatter.format(item.price),
//                     productImage: item.productImage,
//                 })),
//                 totalPrice: formatter.format(cart.totalPrice),
//             },
//         };
  
//         res.status(200).json({ message: "Item quantity reduced successfully.", data: formattedCart });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
//   };
  
// const removeItemFromCart = async (req, res) => {
// 	try {
// 		const userId = req.user._id;
// 		if (!userId) {
// 			return res.status(400).json({ message: "User is not authenticated." });
// 		}
// 		const { productId } = req.body;
// 		const cart = await Cart.findOne({ user: userId });
// 		if (!cart) {
// 			return res.status(404).json({ message: "Cart not found." });
// 		}
// 		const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
// 		if (itemIndex === -1) {
// 			return res.status(404).json({ message: "Item not found in cart." });
// 		}
// 		cart.items.splice(itemIndex, 1);

// 		cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

// 		await cart.save();
//         const formattedCart = {
//             data: {
//               items: cart.items.map(item => ({
//                 productId: item.product, // replace product with productId for clarity
//                 productName: item.productName,
//                 quantity: item.quantity,
//                 price: formatter.format(item.price),
//                 productImage: item.productImage,
//               })),
//               totalPrice: formatter.format(cart.totalPrice),
//             },
//           };
// 		res.status(200).json({ message: "Item removed from cart successfully.", data: formattedCart });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };


// const clearCart = async (req, res) => {
// 	try {
// 		const userId = req.user._id;
// 		if (!userId) {
// 			return res.status(400).json({ message: "User is not authenticated." });
// 		}
// 		const cart = await Cart.findOne({ user: userId });
// 		if (!cart) {
// 			return res.status(404).json({ message: "Cart not found." });
// 		}
// 		cart.items = [];
// 		cart.totalPrice = 0;
// 		await cart.save();
// 		res.status(200).json({ message: "Cart cleared successfully." });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };

// module.exports = { addToCart, viewCart, increaseItemQuantity, reduceItemQuantity, removeItemFromCart, clearCart};
const Cart = require('../models/cartModel');
const productModel = require('../models/productModel');
const mongoose = require('mongoose');
const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 });

// Add to Cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        if (!userId) return res.status(400).json({ message: "User is not authenticated." });
        if (!quantity || quantity <= 0) return res.status(400).json({ message: "Quantity must be a positive number." });

        const [product, cart] = await Promise.all([
            productModel.findById(productId).lean(),
            Cart.findOne({ user: userId }).lean()
        ]);

        if (!product) return res.status(404).json({ message: "Product not found." });

        let updatedCart = cart ? { ...cart } : { user: userId, items: [], totalPrice: 0 };

        const itemIndex = updatedCart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            updatedCart.items[itemIndex].quantity += quantity;
        } else {
            updatedCart.items.push({
                product: productId,
                productName: product.productName,
                quantity,
                price: product.productPrice,
                productImage: product.productImage,
                merchant: product.merchant
            });
        }

        updatedCart.totalPrice = updatedCart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

        await Cart.updateOne({ user: userId }, updatedCart, { upsert: true });

        const formattedCart = formatCart(updatedCart);

        res.status(200).json({
            message: "Item added to cart successfully.",
            data: formattedCart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// View Cart
const viewCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).lean();
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        const formattedCart = formatCart(cart);
        res.status(200).json({ data: formattedCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Increase Item Quantity
const increaseItemQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart." });

        cart.items[itemIndex].quantity += 1;
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();

        const formattedCart = formatCart(cart);
        res.status(200).json({ message: "Item quantity increased successfully.", data: formattedCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reduce Item Quantity
const reduceItemQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart." });

        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);

        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();

        const formattedCart = formatCart(cart);
        res.status(200).json({ message: "Item quantity reduced successfully.", data: formattedCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove Item from Cart
const removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();

        const formattedCart = formatCart(cart);
        res.status(200).json({ message: "Item removed from cart successfully.", data: formattedCart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Format Cart
const formatCart = (cart) => ({
    data: {
        items: cart.items.map(item => ({
            productId: item.product,
            productName: item.productName,
            quantity: item.quantity,
            price: formatter.format(item.price),
            productImage: item.productImage,
        })),
        totalPrice: formatter.format(cart.totalPrice),
    }
});

module.exports = { addToCart, viewCart, increaseItemQuantity, reduceItemQuantity, removeItemFromCart };
