# Estructura del Proyecto

```bash
backend_segunda_entrega/
mi-proyecto/
src/
├── config/
│   └── database.js          # Configuración MongoDB
├── models/
│   ├── product.model.js     # Modelo Product
│   └── cart.model.js        # Modelo Cart
├── dao/
│   ├── ProductDao.js        # DAO Products
│   └── CartDao.js           # DAO Carts
├── routes/
│   ├── products.router.js   # API Products
│   ├── carts.router.js      # API Carts
│   └── views.router.js      # Vistas
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── products.handlebars  # Lista con paginación
│   ├── product-detail.handlebars
│   ├── cart.handlebars      # Vista carrito
│   └── realTimeProducts.handlebars
├── public/
│   ├── css/
│   └── js/
└── app.js                   # Servidor principal