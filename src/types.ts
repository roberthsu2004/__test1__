/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Drink {
  name: string;
  category: string;
  price: number;
}

export interface Order {
  orderId?: string;
  timestamp?: string;
  name: string;
  drink: string;
  sugar: string;
  ice: string;
  quantity: number;
  totalPrice: number;
}

export type ActionType = 'create' | 'update' | 'delete';

export interface ApiResponse {
  menu: Drink[];
  orders: Order[];
}
