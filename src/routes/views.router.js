import { Router } from 'express';
import ProductDao from '../dao/ProductDao.js';
import CartDao from '../dao/CartDao.js';

const router = Router();
const productDao = new ProductDao();
const cartDao = new CartDao();

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/products', async (req, res) => {
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
      return res.render('error', { 
        title: 'Error',
        message: 'Error al cargar productos'
      });
    }

    const buildUrl = (pageNum) => {
      const params = new URLSearchParams();
      if (limit) params.set('limit', limit);
      if (pageNum) params.set('page', pageNum);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      return `/products?${params.toString()}`;
    };

    res.render('products', {
      title: 'Productos',
      products: result.payload,
      pagination: {
        totalPages: result.totalPages,
        currentPage: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        prevLink: result.hasPrevPage ? buildUrl(result.prevPage) : null,
        nextLink: result.hasNextPage ? buildUrl(result.nextPage) : null
      },
      filters: {
        currentLimit: options.limit,
        currentSort: sort || '',
        currentQuery: query || ''
      }
    });
  } catch (error) {
    console.error('Error en GET /products:', error);
    res.render('error', { 
      title: 'Error',
      message: 'Error interno del servidor'
    });
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productDao.getProductById(pid);
    
    if (!product) {
      return res.render('error', { 
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe'
      });
    }

    res.render('product-detail', {
      title: product.title,
      product: product
    });
  } catch (error) {
    console.error('Error en GET /products/:pid:', error);
    res.render('error', { 
      title: 'Error',
      message: 'Error al cargar el producto'
    });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartDao.getCartById(cid);
    
    let total = 0;
    cart.products.forEach(item => {
      total += item.product.price * item.quantity;
    });

    res.render('cart', {
      title: 'Mi Carrito',
      cart: cart,
      total: total.toFixed(2),
      cartId: cid
    });
  } catch (error) {
    console.error('Error en GET /carts/:cid:', error);
    res.render('error', { 
      title: 'Carrito no encontrado',
      message: 'El carrito solicitado no existe'
    });
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productDao.getProducts({ limit: 50 });
    
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      products: result.payload || []
    });
  } catch (error) {
    console.error('Error en GET /realtimeproducts:', error);
    res.render('error', { 
      title: 'Error',
      message: 'Error al cargar productos en tiempo real'
    });
  }
});

export default router;