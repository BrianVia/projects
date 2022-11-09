import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; // CLI imports router
import { SearchComponent } from './routes/search/search.component';
import { UserComponent } from './routes/user/user.component';

const routes: Routes = [
  {
    path: 'user',
    title: 'Wordly Domains | User',
    component: UserComponent, // this is the component with the <router-outlet> in the template
  },
  {
    path: 'search',
    title: 'Wordly Domains | Search',
    component: SearchComponent, // this is the component with the <router-outlet> in the template
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
