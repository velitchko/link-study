import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyComponent } from '../components/survey/survey.component';
import { NodeLinkComponent } from 'src/components/node-link/node-link.component';

const routes: Routes = [
  { path: 'survey', component: SurveyComponent },
  { path: '**', redirectTo: 'survey' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
