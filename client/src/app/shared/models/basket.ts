import * as cuid from "cuid"

export interface BasketItem {
    id: string
    productName: string
    price: number
    quantity: number
    pictureUrl: string
    brand: string
    type: string
}

export interface Basket {
    id: string
    items: BasketItem[]
}
  
export class Basket implements Basket {
    id = cuid();
    Items : BasketItem[] = []
}

export interface BasketTotals {
    shipping: number;
    subtotal: number;
    total: number;
}