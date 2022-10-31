import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'user-ui-word-preferences',
  templateUrl: './word-preferences.component.html',
  styleUrls: ['./word-preferences.component.sass'],
})
export class WordPreferencesComponent implements OnInit {
  @Input() wordPreferences: string[] = [];

  ngOnInit(): void {
    console.log(this.wordPreferences);
  }
}
