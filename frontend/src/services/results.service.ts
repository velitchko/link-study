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
    complexity: string,
    taskCodes: Array<string>,
    taskDescriptions: Array<string>
};

export type Result = {
    index: number,
    time: number,
    task: string,
    encoding: string,
    dataset?: string,
    complexity: string,
    answer: string | number | AgreementAnswer
} | {
    index: number,
    time: number,
    order: Array<string>,
    task?: string,
    encoding: string,
    complexity: string,
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
        ['t1', 'custom'],
        ['t2', 'custom'],
        ['t3', 'boolean'],
        ['t4', 'number'],
        ['t5', 'number'],
        ['t6', 'custom']
    ]);

    private surveySetup: boolean = false;
    private dataSets: Array<string>;

    private results: Array<Result> = new Array<Result>();
    private answerSets: Map<string, Array<string | number>> = new Map<string, Array<string | number>>();

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
            complexity: this.params.complexity
        });
    }

    getUserParams(): Params | null {
        return this.params;
    }

    getCurrentTask(): string {
        return this.params?.taskCodes[this.taskCounter] || '';
    }

    setAnswers(task: string, answers: Array<string | number>): void {
        // always set or reset answers for the task
        this.answerSets.set(task, answers);
    }

    getAnswers(task: string): Array<string | number> {
        // get answers for task
        if (this.answerSets.has(task)) {
            return this.answerSets.get(task) as Array<string | number>;
        } else {
            return new Array<string | number>();
        }
    }


    pushResult(result: Result, increment?: boolean): void {
        // pushes result to local array
        this.results.push(result);
        if (increment) this.taskCounter++;

        console.log('Result pushed:', result);
        console.log('Current task counter:', this.taskCounter);

        console.log('Current results:', this.results);
    }

    setupSurvey(): void {
        if (this.params === null) return;

        const approach = this.params.encoding;
        const complexity = this.params.complexity;
        const dataset = this.dataSets[0];

        this.params.taskCodes.forEach((task, i) => {
            let question = {};

            if (this.taskInputType.get(task) === 'custom') {
                // construct question
                question = {
                    name: `${approach}-${complexity}-${task}`,
                    elements: [
                        {
                            type: 'html',
                            html: `
                                <p id="metadata" style="display: none;">
                                    <span id="encoding">${this.params?.encoding}-${this.params?.complexity}-${dataset}-${task}</span>
                                </p>
                            `
                        },
                        {
                            type: 'node-link-question',
                            description: this.titleMap.get(approach) as string,
                            title: this.params?.taskDescriptions[i],
                            name: `${approach}-${task}`
                        }
                    ]
                };
            } else {
                // construct question
                question = {
                    name: `${approach}-${complexity}-${task}`,
                    elements: [
                        {
                            type: 'html',
                            html: `
                                <p id="metadata" style="display: none;">
                                    <span id="encoding">${this.params?.encoding}-${this.params?.complexity}-${dataset}-${task}</span>
                                </p>
                            `
                        },
                        {
                            type: 'node-link-question',
                            description: this.titleMap.get(approach) as string,
                            title: this.params?.taskDescriptions[i],
                            name: `${approach}-${task}`
                        }
                    ]
                };

                // if number push answer to  question.elements as number else as radiobutton
                if (this.taskInputType.get(task) === 'number') {
                    question['elements'].push({
                        type: 'text',
                        placeholder: 'Enter your answer (number)',
                        inputType: 'number',
                        isRequired: true,
                        title: 'Answer',
                        name: `${approach}-${complexity}-${task}-answer`
                    });
                } else {
                    question['elements'].push({
                        type: 'radiogroup',
                        isRequired: true,
                        title: 'Answer',
                        colCount: 2,
                        name: `${approach}-${complexity}-${task}-answer`,
                        choices: ['Yes', 'No'],
                    });
                }
            }

            const feedback = {
                name: `${approach}-${complexity}-${task}-feedback`,
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
                        name: `${approach}-${complexity}-${task}-feedback`,
                        isRequired: false,
                        title: '(Optional) How did this uncertainty visualization assist or hinder you in solving this particular task?',
                        placeHolder: 'Enter your feedback here'
                    }
                ]
            };
            SURVEY_JSON.pages.push(question);
            SURVEY_JSON.pages.push(feedback);
        });

        console.log('Survey JSON:', SURVEY_JSON);

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