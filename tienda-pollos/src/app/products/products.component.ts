import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../services/products.service';

@Component({
  standalone: true,
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports: [CommonModule],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];

  constructor(
    private cartService: CartService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  addToCart(product: any) {
    this.cartService.addToCart(product.id).subscribe(
      () => {
        alert(`${product.name} ha sido agregado al carrito.`);
      },
      (error) => {
        console.error(error);
        alert('Debes iniciar sesión para agregar al carrito.');
      }
    );
  }
}
