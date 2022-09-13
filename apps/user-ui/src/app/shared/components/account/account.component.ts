import { Component, Input, OnInit } from '@angular/core';
import { Profile, SupabaseService } from '../../services/supabase.service';

import { FormBuilder } from '@angular/forms';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'user-ui-account',
  templateUrl: `./account.component.html`,
})
export class AccountComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private readonly supabase: SupabaseService
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
    this.getProfile();
  }

  async getProfile() {
    try {
      this.loading = true;
      const { data: profile, error, status } = await this.supabase.profile;

      console.log('loaded profile', profile);
      if (error && status !== 406) {
        throw error;
      }

      if (profile) {
        this.profile = profile;
        this.wordPreferences = profile?.word_preferences.join(',') || '';
        this.wordPreferencesForm.controls['wordPreferences'].setValue(
          profile?.word_preferences.join(',') || ''
        );
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      this.loading = false;
    }
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
