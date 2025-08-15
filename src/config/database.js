import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/backend_segunda_entrega';
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB exitosamente');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error de conexión a MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Desconectado de MongoDB');
    });
    
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
  }
};