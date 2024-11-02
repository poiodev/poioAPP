import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe((items) => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  removeFromCart(item: any) {
    this.cartService.removeFromCart(item.cart_item_id).subscribe(() => {
      alert(`${item.name} ha sido eliminado del carrito.`);
      this.loadCart();
    });
  }

  buyItems() {
    this.cartService.checkout().subscribe(
      () => {
        alert('¡Gracias por tu compra!');
        this.loadCart();
      },
      (error) => {
        console.error(error);
        alert('Ocurrió un error al procesar tu compra.');
      }
    );
  }
}
