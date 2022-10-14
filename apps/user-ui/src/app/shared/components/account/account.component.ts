import { Component, Input, OnInit } from '@angular/core';
import { Profile, SupabaseService } from '../../services/supabase.service';

import { FormBuilder } from '@angular/forms';
import { Session } from '@supabase/supabase-js';
import { WordlyService } from '../../services/wordly/wordly.service';

@Component({
  selector: 'user-ui-account',
  templateUrl: `./account.component.html`,
})
export class AccountComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private readonly supabase: SupabaseService,
    private wordlyService: WordlyService
  ) {}

  loading = false;
  profile: Profile | undefined;

  @Input()
  session: Session | undefined;

  wordPreferences = '';

  wordPreferencesForm = this.formBuilder.group({
    wordPreferences: '',
  });

  ngOnInit() {
    console.log('calling wordly service');
    this.wordlyService
      .fetchUserData(this.session?.user?.id || '')
      .subscribe((data) => {
        console.log(data);
      });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.wordPreferencesForm.value);
    this.updateWordPreferences(
      this.wordPreferencesForm.value['wordPreferences']?.split(',') || ['word']
    );
  }

  async updateWordPreferences(wordPreferences: string[]) {
    // debugger;
    try {
      this.loading = true;
      await this.supabase.updateWordPreferences(wordPreferences);
    } catch (error: any) {
      alert(error.message);
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await this.supabase.signOut();
  }
}
