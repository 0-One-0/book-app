import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book, BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList implements OnInit {
  private bookService = inject(BookService);

  books = signal<Book[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.bookService.getAll().subscribe(books => {
      this.books.set(books);
      this.loading.set(false);
    });
  }

  delete(book: Book) {
    if (!confirm(`Vill du radera "${book.title}"?`)) return;

    this.bookService.delete(book.id).subscribe(() =>
      this.books.update(list => list.filter(b => b.id !== book.id))
    );
  }
}