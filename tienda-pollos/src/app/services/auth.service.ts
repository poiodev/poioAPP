import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStatusSubject = new BehaviorSubject<boolean>(this.isTokenAvailable());
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/login`, { username, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.authStatusSubject.next(false);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.authStatusSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private isTokenAvailable(): boolean {
    return !!localStorage.getItem('token');
  }
}
