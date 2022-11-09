import {Injectable, NgModule} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {
  Resolve,
  RouterModule,
  RouterStateSnapshot,
  Routes,
  TitleStrategy,
} from '@angular/router';  // CLI imports router

const routes: Routes = [
  {
    path: 'user',
    title: 'Wordly Domains | User',
    component: FirstComponent,  // this is the component with the <router-outlet> in the template
  },
  {
    path: 'search',
    title: 'Wordly Domains | Search',
    component: FirstComponent,  // this is the component with the <router-outlet> in the template
  }


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: TemplatePageTitleStrategy }],
})
export class AppRoutingModule {}
