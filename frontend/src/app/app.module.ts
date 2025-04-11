// modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { SurveyModule } from "survey-angular-ui";
import { NodeLinkModule } from '../modules/node-link.module';

// handlers
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from '../services/error.service';

// components
import { AppComponent } from './app.component';
import { SurveyComponent  } from '../components/survey/survey.component';
import { CustomNodeLinkQuestionComponent } from '../components/node-link/node-link.question';
import { ErrorComponent } from '../components/error/error.component';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    CustomNodeLinkQuestionComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    SurveyModule,
    NodeLinkModule,
  ],
  providers: [{
    provide: ErrorHandler,
    useClass: GlobalErrorHandler
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
