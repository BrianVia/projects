import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './shared/services/supabase.service';

@Component({
  selector: 'user-ui-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Wordly Domains';
  session = this.supabase.session;

  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
