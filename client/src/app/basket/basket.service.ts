import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Basket, BasketItem, BasketTotals } from '../shared/models/basket';
import { HttpClient } from '@angular/common/http';
import { Product } from '../shared/models/product';
import { DeliveryMethod } from '../shared/models/deliveryMethod';

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  baseUrl = environment.apiUrl;

  private basketSource = new BehaviorSubject<Basket | null>(null);
  basketSource$ = this.basketSource.asObservable();
  private basketTotalSource = new BehaviorSubject<BasketTotals | null>(null);
  basketTotalSource$ = this.basketTotalSource.asObservable();
  shipping = 0;


  constructor(private http: HttpClient){}

  getBasket(id: string){

    return this.http.get<Basket>(this.baseUrl + 'basket?id=' + id)
    .subscribe({
      next: basket => {
        this.basketSource.next(basket);
        this.calculateTotals();
      } 
    });
  }

  setBasket(basket: Basket){

    return this.http.post<Basket>(this.baseUrl + 'basket', basket)
    .subscribe({
      next: basket => {
        this.basketSource.next(basket);
        this.calculateTotals();
      } 
    });
  }

  getCurrentBasketValue(){
    const currentBasket = this.basketSource.value;

    return currentBasket;
  }

  addItemtoBasket(item: Product | BasketItem, quantity = 1){

    if(this.isProduct(item)){
      item = this.mapProductItemToBasketItem(item); 
    }

    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    basket.items = this.addOrUpdateItem(basket.items, item, quantity);
    this.setBasket(basket);
  }

  removeItemFromBasket(id: number, quantity = 1){
    
    const basket = this.getCurrentBasketValue();

    if(!basket){
      return;
    }

    const item = basket.items.find(x=>x.id == id.toString());

    if(item){
      item.quantity -= quantity;

      if(item.quantity == 0){
        basket.items = basket.items.filter(x=>x.id != id.toString());
      }

      if(basket.items.length > 0){
        this.setBasket(basket);
      }
      else{
        this.deleteBasket(basket);
      }
    }

  }

  deleteBasket(basket: Basket) {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id)
      .subscribe({
        next: () => { 
          this.deleteLocalBasket();
        }
      })
  }

  deleteLocalBasket(){
    this.basketSource.next(null);
    this.basketTotalSource.next(null);
    localStorage.removeItem('basket_id');
  }

  private addOrUpdateItem(items: BasketItem[] | null | undefined, itemToAdd: BasketItem, quantity: number): BasketItem[] {

    if (!items) {
      items = [];
  }
    
    const item = items.find(x => x.id == itemToAdd.id);

    // If found, update its quantity
    if (item) {
        item.quantity += quantity;
    } else {
        // If not found, set the quantity for itemToAdd and add it to the array
        itemToAdd.quantity = quantity;
        items.push(itemToAdd);
    }

    return items;
  }

  private createBasket(): Basket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  private mapProductItemToBasketItem(item: Product): BasketItem {

    return {
      id: item.id.toString(),
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.productBrand,
      type: item.productType
    };
  }

  setShippingPrice(deliveryMethod: DeliveryMethod){
    this.shipping = deliveryMethod.price;
    this.calculateTotals();
  }

  private calculateTotals(){

    const basket = this.getCurrentBasketValue();
    if(!basket){
      return;
    }

    const subtotal = basket.items.reduce((previous, current) => (current.price*current.quantity) + previous, 0);
    const total = subtotal + this.shipping;
    this.basketTotalSource.next({ shipping: this.shipping, total, subtotal });
  }

  private isProduct(item: Product | BasketItem): item is Product{
    return (item as Product).productBrand != undefined;
  }
}
