import { Address } from "./user"

export interface Order {
    id: number
    buyerEmail: string
    orderDate: string
    shipToAddress: Address
    deliveryMethod: string
    shippingPrice: number
    orderItems: OrderItem[]
    subTotal: number
    total: number
    status: string
  }
  
  export interface OrderItem {
    productId: number
    productName: string
    pictureUrl: string
    price: number
    quantity: number
  }

  export interface OrderToCreate {
    basketId: string;
    deliveryMethodId: number;
    shipToAddress: Address;
  }