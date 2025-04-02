import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'node-link-question';


@Component({
    selector: 'node-link-question',
    template: `
        <app-node-link></app-node-link>
    `,
})

export class CustomNodeLinkQuestionComponent extends QuestionAngular<NodeLinkQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomNodeLinkQuestionComponent);

export class NodeLinkQuestionModel extends Question {
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
    return new NodeLinkQuestionModel(name);
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
        return new NodeLinkQuestionModel('');
    },
    'question'
);