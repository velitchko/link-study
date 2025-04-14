
import { Component } from '@angular/core';
import { Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { ResultsService } from '../../services/results.service';
import { DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
    protected survey: Model;
    protected completed: boolean = false;

    private timer: {
        start: number,
        end: number
    };

    constructor(protected resultsService: ResultsService, private dataService: DataService, private errorService: GlobalErrorHandler) {
        this.survey = new Model();

        this.timer = {
            start: 0,
            end: 0
        };
    }

    ngAfterViewInit() {
        try {
            this.survey.onAfterRenderSurvey.add(this.init.bind(this));
        } catch (error) {
            this.errorService.handleError(error);
        }
    }


    init(): void {
        // check if survey is setup already if not try again in 1 second
        if (!this.resultsService.isSetup()) {
            setTimeout(() => this.init(), 1000);
            return;
        }

        const survey = new Model(this.resultsService.getSurvey());
        // survey.applyTheme(LayeredDarkPanelless);       

        this.survey = survey;

        this.survey.onStarted.add((sender, options) => {
            this.resultsService.pushResult({
                index: -99,
                time: 0,
                task: 'intro',
                encoding: '',
                variant: '',
                dataset: '',
                level: '',
                uncertainty: -1,
                attribute: -1,
                answer: {
                    confirm: sender.data['question_intro_confirm'],
                    agreement: sender.data['question_intro_agree']
                }
            });
        });



        // update end time and record result
        this.timer.end = Date.now();
        const time = this.timer.end - this.timer.start;



        this.survey.onComplete.add((sender) => {
            console.log('🏁 Survey completed');

            // post to backend
            this.resultsService.submitResults().subscribe((res: Response) => {
                if (res) {
                    console.log(res);
                    this.completed = true;
                    window.open('https://app.prolific.com/submissions/complete?cc=C1FJUP0K', '_blank'); // TODO: Update with prolific link
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};
