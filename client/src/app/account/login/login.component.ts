import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm = new FormGroup({
    
    email: new FormControl('Email', [Validators.required, Validators.email]),
    password: new FormControl('Password', Validators.required)
  });

  returnUrl: string;

  constructor(private accountService: AccountService, private router: Router, private activatedRoute: ActivatedRoute){
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || 'shop'
  }

  onSubmit(){

    this.accountService.login(this.loginForm.value)
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl)
      });
  }
}
