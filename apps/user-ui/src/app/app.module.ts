import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { AuthComponent } from './shared/components/auth/auth.component';
import { AccountComponent } from './shared/components/account/account.component';

@NgModule({
  declarations: [
    AppComponent,
    NxWelcomeComponent,
    AuthComponent,
    AccountComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
