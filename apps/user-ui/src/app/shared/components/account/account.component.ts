import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

import { FormBuilder } from '@angular/forms';
import { Session } from '@supabase/supabase-js';
import { WordlyService } from '../../services/wordly/wordly.service';
import { Profile } from '../../interaces/profile';

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
  profile: Profile | undefined = {
    email: '',
    activeSubscription: false,
    wordPreferences: [],
  };

  @Input()
  session: Session | undefined;

  wordPreferencesForm = this.formBuilder.group({
    wordPreferences: this.profile?.wordPreferences || [''],
  });

  ngOnInit() {
    console.log('calling wordly service');
    this.wordlyService
      .fetchUserData(this.session?.user?.id || '')
      .subscribe((data: Profile) => {
        console.log(data);
        this.profile = data;
        this.wordPreferencesForm.patchValue({
          wordPreferences: this.profile?.wordPreferences?.join(','),
        });
      });
  }

  onSubmit() {
    console.log('on submit');
    console.log(this.wordPreferencesForm.value);
    this.updateWordPreferences(
      this.wordPreferencesForm.value['wordPreferences']?.split(',') || ['word']
    );
  }

  updateWordPreferences(wordPreferences: string[]) {
    // debugger;
    const uid = this.session?.user?.id;
    if (!uid) {
      return;
    } else {
      try {
        this.loading = true;
        this.wordlyService.updateWordPreferences(uid, wordPreferences);
      } catch (error: any) {
        alert(error.message);
      } finally {
        this.loading = false;
      }
    }
  }

  async signOut() {
    await this.supabase.signOut();
  }
}
