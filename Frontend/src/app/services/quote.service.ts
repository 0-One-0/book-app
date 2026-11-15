import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Quote {
  id: number;
  text: string;
  author: string;
}

export type QuoteInput = Omit<Quote, 'id'>;

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/quotes`;

  getAll() {
    return this.http.get<Quote[]>(this.url);
  }

  create(quote: QuoteInput) {
    return this.http.post<Quote>(this.url, quote);
  }

  update(id: number, quote: QuoteInput) {
    return this.http.put<void>(`${this.url}/${id}`, quote);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}