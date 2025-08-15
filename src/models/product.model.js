import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,  // ← Mantener solo esta opción
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  thumbnails: [{
    type: String
  }]
}, {
  timestamps: true,
  versionKey: false
});

productSchema.plugin(mongoosePaginate);

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });

export const Product = mongoose.model('Product', productSchema);