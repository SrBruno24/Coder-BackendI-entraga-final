import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

import { connectDB } from './config/database.js';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

import ProductDao from './dao/ProductDao.js';
import CartDao from './dao/CartDao.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const server = createServer(app);
const io = new Server(server);

const productDao = new ProductDao();
const cartDao = new CartDao();

await connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

const hbs = handlebars.create({
  defaultLayout: 'main',
  layoutsDir: join(__dirname, 'views/layouts'),
  extname: '.handlebars',
  helpers: {
    formatPrice: (price) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(price);
    },
    statusText: (status) => {
      return status ? 'Disponible' : 'No disponible';
    },
    statusBadge: (status) => {
      return status ? 'badge-success' : 'badge-danger';
    },
    range: (start, end) => {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    multiply: (a, b) => a * b,
    stockStatus: (stock) => {
      if (stock === 0) return 'Sin stock';
      if (stock < 10) return 'Poco stock';
      return 'En stock';
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.post('/create-cart', async (req, res) => {
  try {
    const cart = await cartDao.createCart();
    res.json({ 
      status: 'success', 
      cartId: cart._id 
    });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('request-products', async () => {
    try {
      const result = await productDao.getProducts({ limit: 50 });
      socket.emit('products-updated', result.payload || []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      socket.emit('error', 'Error al cargar productos');
    }
  });

  socket.on('add-product', async (productData) => {
    try {
      const product = await productDao.createProduct(productData);
      
      const result = await productDao.getProducts({ limit: 50 });
      
      io.emit('products-updated', result.payload || []);
      io.emit('product-added', {
        status: 'success',
        message: 'Producto agregado exitosamente',
        product
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      socket.emit('product-error', {
        status: 'error',
        message: error.message
      });
    }
  });

  socket.on('delete-product', async (productId) => {
    try {
      await productDao.deleteProduct(productId);
      
      const result = await productDao.getProducts({ limit: 50 });
      
      io.emit('products-updated', result.payload || []);
      io.emit('product-deleted', {
        status: 'success',
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      socket.emit('product-error', {
        status: 'error',
        message: error.message
      });
    }
  });

  socket.on('add-to-cart', async (data) => {
    try {
      const { cartId, productId, quantity = 1 } = data;
      const cart = await cartDao.addProductToCart(cartId, productId, quantity);
      
      socket.emit('cart-updated', {
        status: 'success',
        message: 'Producto agregado al carrito',
        cart
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      socket.emit('cart-error', {
        status: 'error',
        message: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
});

app.use('*', (req, res) => {
  res.status(404).render('error', {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Visita: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});