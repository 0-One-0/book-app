import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected auth = inject(AuthService);
  private router = inject(Router);

  // Sparat val, annars datorns inställning
  protected theme = signal<Theme>(
    (localStorage.getItem('theme') as Theme) ??
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  constructor() {
    this.applyTheme();
  }

  toggleTheme() {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
    this.applyTheme();
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-bs-theme', this.theme());
    localStorage.setItem('theme', this.theme());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}