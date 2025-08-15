import { Router } from 'express';
import CartDao from '../dao/CartDao.js';

const router = Router();
const cartDao = new CartDao();

router.post('/', async (req, res) => {
  try {
    const cart = await cartDao.createCart();
    
    res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      payload: cart
    });
  } catch (error) {
    console.error('Error en POST /api/carts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear el carrito'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const carts = await cartDao.getCarts();
    
    res.status(200).json({
      status: 'success',
      payload: carts
    });
  } catch (error) {
    console.error('Error en GET /api/carts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener carritos'
    });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartDao.getCartById(cid);
    
    res.status(200).json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    console.error('Error en GET /api/carts/:cid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el carrito'
    });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser mayor a 0'
      });
    }
    
    const cart = await cartDao.addProductToCart(cid, pid, quantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Producto agregado al carrito',
      payload: cart
    });
  } catch (error) {
    console.error('Error en POST /api/carts/:cid/product/:pid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar producto al carrito'
    });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: 'error',
        message: 'El formato de productos debe ser un array'
      });
    }
    
    const cart = await cartDao.updateCart(cid, products);
    
    res.status(200).json({
      status: 'success',
      message: 'Carrito actualizado exitosamente',
      payload: cart
    });
  } catch (error) {
    console.error('Error en PUT /api/carts/:cid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el carrito'
    });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser un número mayor a 0'
      });
    }
    
    const cart = await cartDao.updateProductQuantity(cid, pid, quantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Cantidad actualizada exitosamente',
      payload: cart
    });
  } catch (error) {
    console.error('Error en PUT /api/carts/:cid/products/:pid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la cantidad'
    });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartDao.removeProductFromCart(cid, pid);
    
    res.status(200).json({
      status: 'success',
      message: 'Producto eliminado del carrito',
      payload: cart
    });
  } catch (error) {
    console.error('Error en DELETE /api/carts/:cid/products/:pid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar producto del carrito'
    });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartDao.clearCart(cid);
    
    res.status(200).json({
      status: 'success',
      message: 'Carrito vaciado exitosamente',
      payload: cart
    });
  } catch (error) {
    console.error('Error en DELETE /api/carts/:cid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error al vaciar el carrito'
    });
  }
});

export default router;