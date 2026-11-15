import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { BookInput, BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookForm implements OnInit {
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: number | null = null;
  book: BookInput = { title: '', author: '', publishedDate: '' };
  error = signal('');

  ngOnInit() {
    // Finns det ett :id i adressen? Då redigerar vi.
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.bookService.get(this.id).subscribe({
        next: b => this.book = { title: b.title, author: b.author, publishedDate: b.publishedDate },
        error: () => this.router.navigate(['/'])
      });
    }
  }

  save() {
    const request: Observable<unknown> = this.id
      ? this.bookService.update(this.id, this.book)
      : this.bookService.create(this.book);

    request.subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.error.set('Kunde inte spara boken.')
    });
  }
}