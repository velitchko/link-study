// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SURVEY_JSON } from '../assets/survey.js';
import { DataService } from './data.service';
import { CONFIG } from '../assets/config';
import { mapping } from '../assets/datasets/mapping';


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
} | {
    index: number,
    time: number,
    encoding: string,
    complexity: string,
    overall: number,
    effective: string,
    suitable: string,
    alternativeDisplay: string,
    preference: string,
    comments: string,
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

    private qualitativeQuestions: Map<string, string> = new Map([
        ['t1', 'What made it easier or harder to find the connecting nodes in this graph?'],
        ['t2', 'How did you recognize the hub nodes in this graph?'],
        ['t3', 'What clues did you rely on to determine whether a path exists?'],
        ['t4', 'How did you estimate the number of common neighbors between the two nodes?'],
        ['t5', 'What helped you decide how many distinct groups there are?'],
        ['t6', 'How did you find the largest group in the network?'],
    ]);

    private surveySetup: boolean = false;

    private results: Array<Result> = new Array<Result>();
    private answerSets: Map<string, Array<string | number>> = new Map<string, Array<string | number>>();

    constructor(private http: HttpClient, private dataService: DataService) {
        this.params = null;
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
    }

    async setupSurvey(): Promise<void> {
        if (this.params === null) return;

        const approach = this.params.encoding;
        const complexity = this.params.complexity;

        this.params.taskCodes.forEach((task, i) => {
            let question = {};
            
            const dataset = this.dataService.getDatasetNames()
                .filter(name => name.includes(this.params?.complexity || ''))[i % this.dataService.getDatasetNames().length];

            let taskDescription = "";

            if (task === 't3') {
                const datasetMapping = mapping[dataset.replace('.json', '')];
                    if (this.params) {
                        taskDescription = this.params.taskDescriptions[i]
                            .replace('${A}', datasetMapping["pathExists"][0]["newId"])
                            .replace('${B}', datasetMapping["pathExists"][1]["newId"]);
                    }
            }

            if (task === 't4') {
                const datasetMapping = mapping[dataset.replace('.json', '')];
                console.log('Dataset mapping:', datasetMapping);
                    if (this.params) {
                        taskDescription = this.params.taskDescriptions[i]
                            .replace('${A}', datasetMapping["commonNeighbors"][0]["newId"])
                            .replace('${B}', datasetMapping["commonNeighbors"][1]["newId"]);
                    }
            } 
            
            if (task === 't5' || task === 't6' || task === 't1' || task === 't2') {
                taskDescription = this.params?.taskDescriptions[i] || '';
            }


            if (this.taskInputType.get(task) === 'custom') {
                // construct question
                question = {
                    name: `${approach}-${complexity}-${dataset}-${task}`,
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
                            title: taskDescription,
                            name: `${approach}-${complexity}-${dataset}-${task}`
                        }
                    ]
                };
            } else {
                // construct question
                question = {
                    name: `${approach}-${complexity}-${dataset}-${task}`,
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
                            title: taskDescription,
                            name: `${approach}-${complexity}-${dataset}-${task}`
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
                        name: `${approach}-${complexity}-${dataset}-${task}-answer`
                    });
                } else {
                    question['elements'].push({
                        type: 'radiogroup',
                        isRequired: true,
                        title: 'Answer',
                        colCount: 2,
                        name: `${approach}-${complexity}-${dataset}-${task}-answer`,
                        choices: ['Yes', 'No'],
                    });
                }
            }

            const feedback = {
                name: `${approach}-${complexity}-${dataset}-${task}-feedback`,
                elements: [
                    {
                        type: 'html',
                        html: `
                    <p style="font-size: 1.5rem !important; font-weight: bold !important;">The task was:/pb>
                    <p style="font-size: 1.5rem;">${this.params?.taskDescriptions[i]}</p>
                    `
                    },
                    {
                        type: 'comment',
                        name: `${approach}-${complexity}-${dataset}-${task}-feedback`,
                        isRequired: true,
                        title: this.qualitativeQuestions.get(task) as string,
                        placeHolder: 'Enter your feedback here'
                    }
                ]
            };
            SURVEY_JSON.pages.push(question);
            SURVEY_JSON.pages.push(feedback);
        });

        // final page
        const finalPage = {
            name: 'final-page',
            title: 'Open Feedback',
            elements: [
            {
                type: 'html',
                html: `<p style="font-size: 1.5rem !important; font-weight: bold !important;">Overall Impression</p>`
            }, 
            {
                type: 'rating',
                name: 'overall-final',
                isRequired: true,
                title: 'Did this visualization support you in understanding and performing the tasks?',
                minRateDescription: 'Not at all',
                maxRateDescription: 'Extremely',
                rateValues: [
                { value: 1, text: '1' },
                { value: 2, text: '2' },
                { value: 3, text: '3' },
                { value: 4, text: '4' },
                { value: 5, text: '5' },
                { value: 6, text: '6' },
                { value: 7, text: '7' }
                ]
            },
            {
                type: 'comment',
                name: 'effective-final',
                title: 'Comments:',
                isRequired: true,
                placeHolder: 'Enter your feedback here'
            },
            {
                type: 'html',
                html: `<p style="font-size: 1.5rem !important; font-weight: bold !important;">Do you think this type of visualization was better suited for some of the tasks than others?</p>
                <p style="font-size: 1.25rem;">Please explain your reasoning. For example:</p>
                <ul style="font-size: 1.25rem; list-style-type: disc; padding-left: 20px;">
                    <li>Finding connecting nodes in a graph</li>
                    <li>Recognizing hub nodes</li>
                    <li>Determining whether a path exists</li>
                    <li>Estimating the number of common neighbors</li>
                    <li>Identifying distinct groups</li>
                    <li>Finding the largest group in the network</li>
                </ul>`
            }, 
            {
                type: 'comment',
                name: 'suitable-final',
                title: 'Comments:',
                isRequired: true,
                placeHolder: 'Enter your feedback here'
            },
            {
                type: 'html',
                html: `<p style="font-size: 1.5rem !important; font-weight: bold !important;">Was there anything you wished had been shown differently or more clearly?</p>
                <p style="font-size: 1.25rem;">Think about the tasks that you found the hardest to solve. How would you change the visualization to make the task easier?</p>`
            },
            {
                type: 'comment',
                name: 'alternativedisplay-final',
                isRequired: true,
                title: 'Comments:',
                placeHolder: 'Enter your feedback here'
            }, 
            {
                type: 'html',
                html: `<p style="font-size: 1.5rem !important; font-weight: bold !important;">In your experience with this visualization, how did the way links were encoded affect your ability to explore the network? Would you have preferred a different approach?/pb>
                <p style="font-size: 1.25rem;">Did the way links were presented in the visualization support your exploration effectively? Why or why not?</p>`
            }, 
            {
                type: 'comment',
                name: 'preference-final',
                isRequired: true,
                title: 'Comments:',
                placeHolder: 'Enter your feedback here'
            },  
            {
                type: 'html',
                html: `<p style="font-size: 1.5rem !important; font-weight: bold !important;">Any other thoughts or feedback about your experience with the visualization?</p>`
            }, 
            {
                type: 'comment',
                name: 'comments-final',
                isRequired: false,
                title: '(Optional) Please provide your experience.',
                placeHolder: 'Enter your feedback here'
            },

            ]
        };

        SURVEY_JSON.pages.push(finalPage);

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