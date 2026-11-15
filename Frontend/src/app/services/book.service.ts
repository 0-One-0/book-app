import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string; // "yyyy-MM-dd", matchar DateOnly i API:et
}

export type BookInput = Omit<Book, 'id'>;

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/books`;

  getAll() {
    return this.http.get<Book[]>(this.url);
  }

  get(id: number) {
    return this.http.get<Book>(`${this.url}/${id}`);
  }

  create(book: BookInput) {
    return this.http.post<Book>(this.url, book);
  }

  update(id: number, book: BookInput) {
    return this.http.put<void>(`${this.url}/${id}`, book);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}