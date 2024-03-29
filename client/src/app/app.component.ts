import { Component, OnInit } from '@angular/core';
import { BasketService } from './basket/basket.service';
import { AccountService } from 'src/app/account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Skinet';
  
  constructor(private basketService: BasketService, private accountService: AccountService){}
  
  ngOnInit() {
    
    this.loadBasket();
    this.loadCurrentUser();
  }

  loadCurrentUser(){

    const token = localStorage.getItem('token');

    this.accountService.loadCurrentUser(token).subscribe();
  }

  loadBasket(){

    const basketId = localStorage.getItem('basket_id');

    if(basketId){
      this.basketService.getBasket(basketId);
    }
  }
}
