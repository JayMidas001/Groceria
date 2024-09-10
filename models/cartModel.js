const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant'
      },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        productName: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        price: {
          type: Number,
          required: true
        },
        productImage: {
          type: String
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    isCheckedOut: {
      type: Boolean,
      default: false
    },
    savedForLater: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true
  })
cartSchema.methods.calculateTotalPrice = function() {
    this.totalPrice = this.items.reduce((acc, item) => {
      if (typeof item.price === 'number') {
        return acc + item.quantity * item.price;
      } else {
        return acc;
      }
    }, 0);
    return this.totalPrice;
  };

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
