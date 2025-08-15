import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';

class CartDao {
  async createCart() {
    try {
      const cart = new Cart({ products: [] });
      await cart.save();
      return cart;
    } catch (error) {
      console.error('Error al crear carrito:', error);
      throw new Error('Error al crear el carrito');
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await Cart.findById(cartId)
        .populate('products.product')
        .lean();
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      return cart;
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw new Error('Error al obtener el carrito');
    }
  }

  async getCarts() {
    try {
      const carts = await Cart.find()
        .populate('products.product')
        .lean();
      return carts;
    } catch (error) {
      console.error('Error al obtener carritos:', error);
      throw new Error('Error al obtener carritos');
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const existingProductIndex = cart.products.findIndex(
        p => p.product.toString() === productId
      );

      if (existingProductIndex > -1) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity: quantity
        });
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw new Error('Error al agregar producto al carrito');
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = cart.products.filter(
        p => p.product.toString() !== productId
      );

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      throw new Error('Error al eliminar producto del carrito');
    }
  }

  async updateCart(cartId, products) {
    try {
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Producto ${item.product} no encontrado`);
        }
      }

      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products },
        { new: true, runValidators: true }
      );

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return await this.getCartById(cartId);
    } catch (error) {
      console.error('Error al actualizar carrito:', error);
      throw new Error('Error al actualizar el carrito');
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const productIndex = cart.products.findIndex(
        p => p.product.toString() === productId
      );

      if (productIndex === -1) {
        throw new Error('Producto no encontrado en el carrito');
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();

      return await this.getCartById(cartId);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw new Error('Error al actualizar la cantidad del producto');
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      );

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return cart;
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      throw new Error('Error al limpiar el carrito');
    }
  }

  async deleteCart(cartId) {
    try {
      const cart = await Cart.findByIdAndDelete(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      return { message: 'Carrito eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar carrito:', error);
      throw new Error('Error al eliminar el carrito');
    }
  }

  async getCartTotal(cartId) {
    try {
      const cart = await this.getCartById(cartId);
      let total = 0;

      cart.products.forEach(item => {
        total += item.product.price * item.quantity;
      });

      return total;
    } catch (error) {
      console.error('Error al calcular total del carrito:', error);
      throw new Error('Error al calcular el total');
    }
  }
}

export default CartDao;