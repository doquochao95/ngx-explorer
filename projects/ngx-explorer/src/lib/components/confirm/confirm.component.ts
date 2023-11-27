import { Component, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
    selector: 'nxe-confirm',
    templateUrl: './confirm.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ConfirmComponent  {
    public message : string =''
    public onClose: Subject<boolean>;

    constructor(public _bsModalRef: BsModalRef) { }

    public ngOnInit(): void {
        this.onClose = new Subject();
    }

    public onConfirm(): void {
        this.onClose.next(true);
        this._bsModalRef.hide();
    }

    public onCancel(): void {
        this.onClose.next(false);
        this._bsModalRef.hide();
    }
}
