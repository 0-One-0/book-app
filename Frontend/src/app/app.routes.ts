import { Routes } from '@angular/router';
import { BookList } from './pages/book-list/book-list';
import { BookForm } from './pages/book-form/book-form';
import { Quotes } from './pages/quotes/quotes';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: BookList },
  { path: 'books/new', component: BookForm },
  { path: 'books/:id/edit', component: BookForm },
  { path: 'quotes', component: Quotes },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' }
];