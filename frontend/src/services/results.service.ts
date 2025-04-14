// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SURVEY_JSON } from '../assets/survey.js';
import { DataService } from './data.service';
import { CONFIG } from '../assets/config';


type AgreementAnswer = {
    confirm: string,
    agreement: string
};

export type Params = {
    user: string,
    encoding: string,
    dataset: string,
    level: string,
    taskCodes: Array<string>,
    taskDescriptions: Array<string>
};

export type Result = { 
    index: number,
    time: number, 
    task: string, 
    encoding: string, 
    variant: string,
    dataset: string,
    level: string,
    uncertainty: number,
    attribute: number,
    answer: string | number | AgreementAnswer
} | {
    index: number,
    time: number,
    order: Array<string>,
    task?: string,
    encoding: string,
    variant: string,
    dataset: string,
    level: string,
    uncertainty: number,
    attribute: number,
};
@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private params: Params | null;
    private taskCounter: number = 0;

    protected titleMap: Map<string, string> = new Map([
        ['nodelink', 'Node-Link Diagram'],
        ['nolink', 'No Link Diagram'],
        ['interactive', 'Interactive Link Diagram'],
    ]);

    protected taskInputType: Map<string, string> = new Map([
        ['t1', 'text'],
        ['t2', 'text'],
        ['t3', 'text'],
        ['t4', 'text'],
        ['t5', 'number'],
        ['t6', 'number'],
        ['t7', 'text'],
        ['t8', 'text'],
    ]);

    private surveySetup: boolean = false;
    private dataSets: Array<string>;

    private results: Array<Result> = new Array<Result>();

    constructor(private http: HttpClient, private dataService: DataService) {
        this.params = null;

        this.dataSets = this.dataService.getDatasetNames();
    }

    setUserParams(params: Params): void {
        this.params = params;

        // add metadata to results
        this.results.push({
            index: -99,
            time: 0,
            order: this.params.taskCodes,
            encoding: this.params.encoding,
            variant: "",
            dataset: this.params.dataset,
            level: this.params.level,
            uncertainty: -1,
            attribute: -1
        });
    }

    getUserParams(): Params | null {
        return this.params;
    }

    getCurrentTask(): string {
        return this.params?.taskCodes[this.taskCounter] || '';
    }

    pushResult(result: Result, increment?: boolean): void {
        // pushes result to local array
        this.results.push(result);
        if(increment) this.taskCounter++;
    }

    setupSurvey(): void {
        if (this.params === null) return;
        
        const approach = this.params.encoding;

        // iterate over this.params.eogNetApproaches
        let variant = 1;

        this.params.taskCodes.forEach((task, i) => {
            // construct question
            const question = {
                name: `${approach}-${task}-${variant}`,
                elements: [
                    {
                        type: 'html',
                        html: `
                            <p id="metadata" style="display: none;">
                                ${this.params?.dataset}-${variant}-${this.params?.level}-${task}
                            </p>
                        ` 
                    },
                    {
                        type: 'node-link-question',
                        description: this.titleMap.get(approach) as string,
                        title: this.params?.taskDescriptions[i],
                        name: `${approach}-${task}-${variant}`
                    },
                    {
                        type: 'text',
                        placeholder: this.taskInputType.get(task) === 'number' ? 'Enter your answer (number)' : 'Enter your answer here',
                        inputType: this.taskInputType.get(task) as string,
                        isRequired: true,
                        title: 'Answer',
                        name: `${approach}-${task}-${variant}-answer`
                    }
                ]
            };

            const feedback = {
                name: `${approach}-${task}-feedback`,
                elements: [
                    {
                        type: 'html',
                        html: `
                        <h3>The task was:</h3>
                        <p style="font-size: 1.5rem;">${this.params?.taskDescriptions[i]}</p>
                        `
                    },
                    {
                        type: 'comment', 
                        name: `${approach}-${task}-feedback`,
                        isRequired: false,
                        title: '(Optional) How did this uncertainty visualization assist or hinder you in solving this particular task?',
                        placeHolder: 'Enter your feedback here'
                    }
                ]
            };

            SURVEY_JSON.pages.push(question);
            SURVEY_JSON.pages.push(feedback);

            variant++;
        });
        this.surveySetup = true;
    }

    isSetup(): boolean {
        return this.surveySetup;
    }

    getSurvey(): any {
        return SURVEY_JSON;
    }

    submitResults(): Observable<any> {
        // submits results to backend
        return this.http.post(`${CONFIG.API_BASE}results`, { params: this.params, results: this.results });
    }
}