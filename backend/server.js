const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Importamos las funciones desde cart.js
const { getCart, addToCart, removeFromCart, clearCart } = require("./cart");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = require("./db");

const SECRET_KEY = "tu_clave_secreta";

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Iniciar sesión
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error iniciando sesión:", err);
      res.status(500).json({ error: "Error al iniciar sesión" });
    } else if (results.length === 0) {
      res.status(401).json({ error: "Usuario no encontrado" });
    } else {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // Generar token JWT
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
          expiresIn: "1h",
        });
        res.json({ message: "Inicio de sesión exitoso", token });
      } else {
        res.status(401).json({ error: "Contraseña incorrecta" });
      }
    }
  });
});

// Registrar usuario
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error("Error registrando usuario:", err);
      res.status(500).json({ error: "Error al registrar usuario" });
    } else {
      res.status(201).json({ message: "Usuario registrado" });
    }
  });
});

// Obtener todos los productos
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error obteniendo productos:", err);
      res.status(500).json({ error: "Error al obtener productos" });
    } else {
      res.json(results);
    }
  });
});

// Obtener el carrito del usuario autenticado
app.get("/cart", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = `
    SELECT c.id as cart_item_id, p.*
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error obteniendo el carrito:", err);
      res.status(500).json({ error: "Error al obtener el carrito" });
    } else {
      res.json(results);
    }
  });
});

// Agregar al carrito
app.post("/cart", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;
  const sql = "INSERT INTO cart (user_id, product_id) VALUES (?, ?)";
  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Error agregando al carrito:", err);
      res.status(500).json({ error: "Error al agregar al carrito" });
    } else {
      res.status(201).json({ message: "Producto agregado al carrito" });
    }
  });
});

// Obtener el carrito de un usuario
app.get("/cart/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT c.id as cart_item_id, p.*
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error obteniendo el carrito:", err);
      res.status(500).json({ error: "Error al obtener el carrito" });
    } else {
      res.json(results);
    }
  });
});

// Limpiar el carrito
app.delete("/cart/clear", (req, res) => {
  clearCart();
  res.status(200).json({ message: "Carrito limpiado" });
});

// Limpiar el carrito
app.delete("/cart/clear", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "DELETE FROM cart WHERE user_id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error limpiando el carrito:", err);
      res.status(500).json({ error: "Error al limpiar el carrito" });
    } else {
      res.status(200).json({ message: "Carrito limpiado" });
    }
  });
});

// Eliminar un producto del carrito
app.delete("/cart/:cartItemId", authenticateToken, (req, res) => {
  const cartItemId = req.params.cartItemId;
  const userId = req.user.userId;
  const sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
  db.query(sql, [cartItemId, userId], (err, result) => {
    if (err) {
      console.error("Error eliminando del carrito:", err);
      res.status(500).json({ error: "Error al eliminar del carrito" });
    } else {
      res.status(200).json({ message: "Producto eliminado del carrito" });
    }
  });
});

// Comprar productos del carrito
app.post('/checkout', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // Iniciar una transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error iniciando transacción:', err);
      return res.status(500).json({ error: 'Error al procesar la compra' });
    }

    // Paso 1: Crear una orden
    const insertOrderSql = 'INSERT INTO orders (user_id) VALUES (?)';
    db.query(insertOrderSql, [userId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error creando orden:', err);
          res.status(500).json({ error: 'Error al procesar la compra' });
        });
      }

      const orderId = result.insertId;

      // Paso 2: Obtener los productos del carrito
      const getCartSql = 'SELECT product_id FROM cart WHERE user_id = ?';
      db.query(getCartSql, [userId], (err, cartItems) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error obteniendo el carrito:', err);
            res.status(500).json({ error: 'Error al procesar la compra' });
          });
        }

        if (cartItems.length === 0) {
          return db.rollback(() => {
            res.status(400).json({ error: 'El carrito está vacío' });
          });
        }

        // Paso 3: Insertar productos en order_items
        const insertOrderItemsSql = 'INSERT INTO order_items (order_id, product_id) VALUES ?';
        const orderItemsData = cartItems.map((item) => [orderId, item.product_id]);

        db.query(insertOrderItemsSql, [orderItemsData], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error insertando productos en la orden:', err);
              res.status(500).json({ error: 'Error al procesar la compra' });
            });
          }

          // Paso 4: Limpiar el carrito
          const clearCartSql = 'DELETE FROM cart WHERE user_id = ?';
          db.query(clearCartSql, [userId], (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error limpiando el carrito:', err);
                res.status(500).json({ error: 'Error al procesar la compra' });
              });
            }

            // Confirmar transacción
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error confirmando transacción:', err);
                  res.status(500).json({ error: 'Error al procesar la compra' });
                });
              }

              res.status(200).json({ message: 'Compra realizada exitosamente' });
            });
          });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
