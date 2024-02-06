import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ShopService } from './shop.service';
import { Product } from '../shared/models/product';
import { Brand } from '../shared/models/brand';
import { Type } from '../shared/models/type';
import { ShopParams } from '../shared/models/shopParams';   

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  products: Product[] = [];
  brands: Brand [] = [];
  types: Type[] = [];
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: low to high', value: 'priceAsc' },
    { name: 'Price: high to low', value: 'priceDesc' }
  ];
  shopParams: ShopParams;
  totalCount = 0;
  @ViewChild('search') searchTerm?: ElementRef;

  constructor(private shopService: ShopService){
    
    this.shopParams = this.shopService.getShopParams();
  }


  ngOnInit(): void {
    this.getProducts();
    this.getBrands();
    this.getTypes();
  }

  getProducts(){
    this.shopService.getProducts()
      .subscribe({
        next: response => { 

          if(response == null){
            this.products = [];
            this.shopParams.pageNumber = 1;
            this.shopParams.pageSize = 6;
            this.totalCount = 0;
          }
          else{
            this.products = response.data;

            this.totalCount = response.count;
          }
         },
        error: error => console.log(error)
      })
  }

  getBrands(){
    this.shopService.getBrands()
      .subscribe({
        next: response => this.brands = [{id: 0, name: 'All'}, ...response],
        error: error => console.log(error)
      })
  }

  getTypes(){
    this.shopService.getTypes()
      .subscribe({
        next: response => this.types = [{id: 0, name: 'All'}, ...response],
        error: error => console.log(error)
      })
  }

  onBrandSelected(brandId: number){

    const params = this.shopService.getShopParams();

    params.brandId = brandId;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.shopParams = params;
    this.getProducts();
  }

  onTypeSelected(typeId: number){

    const params = this.shopService.getShopParams();

    params.typeId = typeId;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.shopParams = params;
    this.getProducts();
  }

  onSortSelected(event: any){

    const params = this.shopService.getShopParams();

    params.sort = event.target.value;
    this.shopService.setShopParams(params);
    this.shopParams = params;
    this.getProducts();
  }

  onPageChanged(event: any){

    const params = this.shopService.getShopParams();
   
    if(params.pageNumber != event){
      params.pageNumber = event;
      this.shopService.setShopParams(params);
      this.shopParams = params;
      this.getProducts();
    }
  }

  onSearch(){

    const params = this.shopService.getShopParams();

    params.search = this.searchTerm?.nativeElement.value;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.shopParams = params;
    this.getProducts();
  }

  onReset(){
    if(this.searchTerm){
      this.searchTerm.nativeElement.value = '';
      this.shopParams = new ShopParams();
      this.shopService.setShopParams(this.shopParams);
      this.getProducts();
    }
  }
}
