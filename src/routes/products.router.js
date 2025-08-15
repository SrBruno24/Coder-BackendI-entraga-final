import { Router } from 'express';
import ProductDao from '../dao/ProductDao.js';

const router = Router();
const productDao = new ProductDao();

router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
      sort,
      query
    };

    const result = await productDao.getProducts(options);
    
    if (result.status === 'error') {
      return res.status(500).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productDao.getProductById(pid);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    console.error('Error en GET /api/products/:pid:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }

    const product = await productDao.createProduct(productData);
    
    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      payload: product
    });
  } catch (error) {
    console.error('Error en POST /api/products:', error);
    
    if (error.message.includes('código del producto ya existe')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updateData = req.body;
    
    delete updateData._id;
    delete updateData.id;
    
    const product = await productDao.updateProduct(pid, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      payload: product
    });
  } catch (error) {
    console.error('Error en PUT /api/products/:pid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const result = await productDao.deleteProduct(pid);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Error en DELETE /api/products/:pid:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

export default router;