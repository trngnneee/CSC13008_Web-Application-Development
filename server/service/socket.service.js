import { getAllProducts } from "./product.service.js";

let socketIoInstance = null;

export function initSocket(io) {
    socketIoInstance = io;
    io.on("connection", (socket) => {
        socket.on("product:get", async (filter) => {
            try {
                const products = await getAllProducts(filter || {});
                socket.emit("product:list", products);
            }
            catch (error) {
                console.error("Error fetching products:", error);
            }
        })

        socket.on("disconnect", () => {
        })
    })
}

export function emitNewProduct(product) {
    if (!socketIoInstance) return;

    socketIoInstance.emit("product:new", product);
}