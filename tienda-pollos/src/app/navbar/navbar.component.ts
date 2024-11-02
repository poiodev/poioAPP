import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/cart.service';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule],
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount$: Observable<number> = of(0);
  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    const authSub = this.authService.authStatus$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.cartItemCount$ = this.cartService.cartItemCount;
      } else {
        this.cartItemCount$ = of(0);
      }
    });
    this.subscriptions.add(authSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
