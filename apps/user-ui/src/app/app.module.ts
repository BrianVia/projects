import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { AuthComponent } from './shared/components/auth/auth.component';
import { AccountComponent } from './shared/components/account/account.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    NxWelcomeComponent,
    AuthComponent,
    AccountComponent,
    FooterComponent,
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
