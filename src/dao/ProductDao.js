import { Product } from '../models/product.model.js';

class ProductDao {
  async getProducts(options = {}) {
    try {
      const {
        limit = 10,
        page = 1,
        sort,
        query
      } = options;

      let filter = {};
      if (query) {
        if (query === 'available') {
          filter.status = true;
        } else if (query === 'unavailable') {
          filter.status = false;
        } else {
          filter.category = { $regex: query, $options: 'i' };
        }
      }

      let sortOptions = {};
      if (sort) {
        if (sort === 'asc') {
          sortOptions.price = 1;
        } else if (sort === 'desc') {
          sortOptions.price = -1;
        }
      }

      const options_paginate = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
        lean: true
      };

      const result = await Product.paginate(filter, options_paginate);
      
      return {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,
        nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null
      };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id).lean();
      return product;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw new Error('Producto no encontrado');
    }
  }

  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return product;
    } catch (error) {
      console.error('Error al crear producto:', error);
      if (error.code === 11000) {
        throw new Error('El código del producto ya existe');
      }
      throw new Error('Error al crear el producto');
    }
  }

  async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('Error al actualizar el producto');
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return { message: 'Producto eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('Error al eliminar el producto');
    }
  }

  async getProductsByCategory(category) {
    try {
      const products = await Product.find({ 
        category: { $regex: category, $options: 'i' } 
      }).lean();
      return products;
    } catch (error) {
      console.error('Error al buscar productos por categoría:', error);
      throw new Error('Error al buscar productos');
    }
  }

  async checkStock(id, quantity = 1) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product.stock >= quantity;
    } catch (error) {
      console.error('Error al verificar stock:', error);
      throw new Error('Error al verificar stock');
    }
  }
}

export default ProductDao;