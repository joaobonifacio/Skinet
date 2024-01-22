import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {

  busyRequestService = 0;

  constructor(private spinnerService: NgxSpinnerService) { }

  busy(){
    this.busyRequestService++;
    this.spinnerService.show(undefined, {
      type: 'timer',
      bdColor: 'rgba(255, 255, 255, 0.7)',
      color: '#333333'
    })
  }

  idle() {
    this.busyRequestService--;

    if(this.busyRequestService <= 0){
      this.busyRequestService = 0;
      this.spinnerService.hide();
    }
  }
}
