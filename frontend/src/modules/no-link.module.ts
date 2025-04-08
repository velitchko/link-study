import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoLinkComponent } from '../components/no-link/no-link.component';

@NgModule({
    declarations: [
        NoLinkComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NoLinkComponent
    ]
})
export class NoLinkModule { }