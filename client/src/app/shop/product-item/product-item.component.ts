import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { BasketService } from '../../basket/basket.service';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent {

  @Input() product?: Product;

  constructor(private basketService: BasketService){}

  addItemToBasket(){
    console.log(this.product?.name);
    this.product && this.basketService.addItemtoBasket(this.product);
  }

}
