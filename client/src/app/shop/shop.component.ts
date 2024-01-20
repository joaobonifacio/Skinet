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
  shopParams = new ShopParams();
  totalCount = 0;
  @ViewChild('search') searchTerm?: ElementRef;

  constructor(private shopService: ShopService){}


  ngOnInit(): void {
    this.getProducts();
    this.getBrands();
    this.getTypes();
  }

  getProducts(){
    this.shopService.getProducts(this.shopParams)
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
            this.shopParams.pageNumber = response.pageIndex;
            this.shopParams.pageSize = response.pageSize;
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
    this.shopParams.brandId = brandId;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onTypeSelected(typeId: number){
    this.shopParams.typeId = typeId;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onSortSelected(event: any){
    this.shopParams.sort = event.target.value;
    this.getProducts();
  }

  onPageChanged(event: any){
   
    if(this.shopParams.pageNumber != event){
      this.shopParams.pageNumber = event;
      this.getProducts();
    }
  }

  onSearch(){
    this.shopParams.search = this.searchTerm?.nativeElement.value;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onReset(){
    if(this.searchTerm){
      this.searchTerm.nativeElement.value = '';
      this.shopParams = new ShopParams();
      this.getProducts();
    }
  }
}
