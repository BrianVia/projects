import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'user-ui-word-preferences',
  templateUrl: './word-preferences.component.html',
  styleUrls: ['./word-preferences.component.sass'],
})
export class WordPreferencesComponent implements OnInit {
  public wordPreferencesForm: FormGroup = new FormGroup({});
  @Input() wordPreferences: string[] = [];

  ngOnInit(): void {
    console.log(this.wordPreferences);
    console.log(this.wordPreferencesForm);
    this.wordPreferences.forEach((word) => {
      this.wordPreferencesForm.addControl(word, new FormControl(word));
    });

    console.log(this.wordPreferencesForm);
  }
  addWordPreference() {
    this.wordPreferences.push('');
  }
}
