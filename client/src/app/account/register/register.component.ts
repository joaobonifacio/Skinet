import { Component } from '@angular/core';
import { AccountService } from '../account.service';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, debounceTime, finalize, map, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  errors: string[] | null = null;
  complexPassword = "(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$";

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router){}

  registerForm = this.fb.group({
    
    displayName: ['Display Name', Validators.required],
    email: ['Email', [Validators.required, Validators.email], [this.validateEmailNotTaken()]],
    password: ['Password', [Validators.required, Validators.pattern(this.complexPassword)]]
  });

  onSubmit(){

    this.accountService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/shop');
        },
        error: error => this.errors = error.errors 
      });
  }

  validateEmailNotTaken(): AsyncValidatorFn {

    return (control: AbstractControl)  => {

      return control.valueChanges.pipe(debounceTime(1000),
      take(1),
      switchMap(() => {
        return this.accountService.checkEmailExists(control.value)
        .pipe(map(result =>  result ? {emailExists: true} : null),
          catchError(() => of(null)),
        finalize(() => control.markAsTouched()));
      }))
    }
  }
}
