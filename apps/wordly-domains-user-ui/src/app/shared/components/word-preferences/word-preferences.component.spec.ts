import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordPreferencesComponent } from './word-preferences.component';

describe('WordPreferencesComponent', () => {
  let component: WordPreferencesComponent;
  let fixture: ComponentFixture<WordPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WordPreferencesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WordPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
