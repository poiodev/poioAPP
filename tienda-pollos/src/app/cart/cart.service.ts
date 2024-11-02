import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialCart();
  }

  private loadInitialCart() {
    this.getCart().subscribe();
  }

  getCart(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/cart`).pipe(
      tap((items) => {
        this.cartItemsSubject.next(items);
      })
    );
  }

  addToCart(productId: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/cart`, { productId }).pipe(
      tap(() => {
        this.getCart().subscribe();
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${API_URL}/cart/${cartItemId}`).pipe(
      tap(() => {
        this.getCart().subscribe();
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${API_URL}/cart/clear`).pipe(
      tap(() => {
        this.cartItemsSubject.next([]);
      })
    );
  }

  checkout(): Observable<any> {
    return this.http.post(`${API_URL}/checkout`, {}).pipe(
      tap(() => {
        this.cartItemsSubject.next([]);
      })
    );
  }

  get cartItemCount(): Observable<number> {
    return this.cartItems$.pipe(map((items) => items.length));
  }
}
