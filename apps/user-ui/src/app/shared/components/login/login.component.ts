import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'user-ui-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  loading = false;

  constructor(private readonly supabase: SupabaseService) {}

  async handleLogin(input: string) {
    try {
      this.loading = true;
      await this.supabase.signIn(input);
      alert('Check your email for the login link!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      this.loading = false;
    }
  }
}
