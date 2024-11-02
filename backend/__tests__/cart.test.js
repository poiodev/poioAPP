const { addToCart, getCart, clearCart } = require('../cart');

describe('Pruebas para agregar al carrito', () => {
  beforeEach(() => {
    clearCart();
  });

  test('Agregar un producto al carrito', () => {
    const product = { name: 'Producto 1', price: 10 };
    const result = addToCart(product);

    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('name', 'Producto 1');
    expect(result).toHaveProperty('price', 10);

    const cart = getCart();
    expect(cart.length).toBe(1);
    expect(cart[0]).toEqual(result);
  });

  test('Agregar múltiples productos al carrito', () => {
    const product1 = { name: 'Producto 1', price: 10 };
    const product2 = { name: 'Producto 2', price: 20 };

    addToCart(product1);
    addToCart(product2);

    const cart = getCart();
    expect(cart.length).toBe(2);
    expect(cart[0]).toHaveProperty('id', 1);
    expect(cart[1]).toHaveProperty('id', 2);
  });
});

const { removeFromCart } = require('../cart');

describe('Pruebas para eliminar del carrito', () => {
  beforeEach(() => {
    clearCart();
    addToCart({ name: 'Producto 1', price: 10 });
    addToCart({ name: 'Producto 2', price: 20 });
  });

  test('Eliminar un producto existente del carrito', () => {
    const result = removeFromCart(1);

    expect(result).toBe(true);

    const cart = getCart();
    expect(cart.length).toBe(1);
    expect(cart[0]).toHaveProperty('id', 2);
  });

  test('Intentar eliminar un producto que no existe', () => {
    const result = removeFromCart(999);

    expect(result).toBe(false);

    const cart = getCart();
    expect(cart.length).toBe(2);
  });
});
