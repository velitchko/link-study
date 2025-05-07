import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Params, ResultsService } from '../services/results.service';
import { GlobalErrorHandler } from '../services/error.service';
import { retry } from 'rxjs';
import { CONFIG } from '../assets/config';
import { DataService } from 'src/services/data.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Uncertainty Network Study';
  
  constructor(private http: HttpClient, protected resultsService: ResultsService, private dataService: DataService, private errorService: GlobalErrorHandler) {
    this.dataService.loadAllData(); // load all data from backend
  }

  next(result: any) {
    if (result.status === 200) {
      this.resultsService.setUserParams(result.params);
      this.resultsService.setupSurvey();
      console.log('👌Got survey params from backend');
      console.log(result);
    } else {
      console.error('🚒 Error: no params received from backend');
    }
  }

  error(err: Error): void {
    this.errorService.handleError(err)
  }

  ngOnInit() {
    // request params from backend
    this.http.get<Params>(`${CONFIG.API_BASE}params`)
      .pipe(
        retry(3)
      )
      .subscribe({
        next: this.next.bind(this),
        error: this.error.bind(this)
      });

  }
}
