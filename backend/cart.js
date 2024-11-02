let cart = [];
let idCounter = 1;

function getCart() {
  return cart;
}

function addToCart(product) {
  const newProduct = { ...product, id: idCounter++ };
  cart.push(newProduct);
  return newProduct;
}

function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    return true;
  }
  return false;
}

function clearCart() {
  cart = [];
  idCounter = 1;
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};