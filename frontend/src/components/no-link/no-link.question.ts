import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'node-link-question';


@Component({
    selector: 'no-link-question',
    template: `
        <app-no-link></app-no-link>
    `,
})

export class CustomNoLinkQuestionComponent extends QuestionAngular<NoLinkQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomNoLinkQuestionComponent);

export class NoLinkQuestionModel extends Question {
    override getType() {
        return CUSTOM_TYPE;
    }

    override get name() {
        return this.getPropertyValue('name');
    }

    override set name(value) {
        this.setPropertyValue('name', value);
    }
}


ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new NoLinkQuestionModel(name);
});

Serializer.addClass(
    CUSTOM_TYPE,
    [
        {
            name: 'description'
        },
        {
            name: 'title'
        }
    ],
    () => {
        return new NoLinkQuestionModel('');
    },
    'question'
);