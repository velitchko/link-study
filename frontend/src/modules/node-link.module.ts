import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeLinkComponent } from '../components/node-link/node-link.component';

@NgModule({
    declarations: [
        NodeLinkComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NodeLinkComponent
    ]
})
export class NodeLinkModule { }