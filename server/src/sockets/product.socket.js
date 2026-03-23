import { PRODUCT_EVENTS } from '../constants/socketEvents.js';
import { getAllProducts } from '../services/product.service.js';

let socketIoInstance = null;

export default function registerProductHandlers(io, socket) {
  socketIoInstance = io;

  socket.on(PRODUCT_EVENTS.GET, async (filter) => {
    try {
      const products = await getAllProducts(filter || {});
      socket.emit(PRODUCT_EVENTS.LIST, products);
    } catch (error) {
      console.error('Error fetching products via socket:', error);
    }
  });
}

export function emitNewProduct(product) {
  if (!socketIoInstance) return;
  socketIoInstance.emit(PRODUCT_EVENTS.NEW, product);
}
