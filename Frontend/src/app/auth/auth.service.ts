import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  // true/false som menyn kan reagera på
  isLoggedIn = signal(this.hasValidToken());

  register(username: string, password: string) {
    return this.http.post(`${this.url}/register`, { username, password });
  }

  login(username: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.url}/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this.isLoggedIn.set(true);
        })
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.isLoggedIn.set(false);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Finns en token och har den inte gått ut?
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload));
      return exp * 1000 > Date.now();
    } catch {
      return false; // trasig token
    }
  }
}