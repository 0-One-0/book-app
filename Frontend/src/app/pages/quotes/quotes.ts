import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Quote, QuoteInput, QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-quotes',
  imports: [FormsModule],
  templateUrl: './quotes.html',
  styleUrl: './quotes.css'
})
export class Quotes implements OnInit {
  private quoteService = inject(QuoteService);

  quotes = signal<Quote[]>([]);
  newQuote: QuoteInput = { text: '', author: '' };

  // Vilket citat som redigeras just nu (null = inget)
  editingId = signal<number | null>(null);
  editQuote: QuoteInput = { text: '', author: '' };

  ngOnInit() {
    this.quoteService.getAll().subscribe(quotes => this.quotes.set(quotes));
  }

  add() {
    this.quoteService.create(this.newQuote).subscribe(created => {
      this.quotes.update(list => [...list, created]);
      this.newQuote = { text: '', author: '' }; // töm formuläret
    });
  }

  startEdit(quote: Quote) {
    this.editingId.set(quote.id);
    this.editQuote = { text: quote.text, author: quote.author }; // kopia, inte originalet
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(id: number) {
    const changes = { ...this.editQuote };
    this.quoteService.update(id, changes).subscribe(() => {
      this.quotes.update(list => list.map(q => q.id === id ? { id, ...changes } : q));
      this.editingId.set(null);
    });
  }

  delete(quote: Quote) {
    if (!confirm('Vill du radera citatet?')) return;

    this.quoteService.delete(quote.id).subscribe(() =>
      this.quotes.update(list => list.filter(q => q.id !== quote.id))
    );
  }
}