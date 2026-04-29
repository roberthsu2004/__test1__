/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Drink, Order, ApiResponse } from './types.ts';
import OrderForm from './components/OrderForm.tsx';
import OrderList from './components/OrderList.tsx';
import { RefreshCw, Coffee, Info } from 'lucide-react';
import { motion } from 'motion/react';

const API_URL = 'https://script.google.com/macros/s/AKfycbyI-H2tw3aHv-Tqq1SVzjsRWcztPoWGyt63xCn-AmTVtpx6SIZ5wxkmDERUaWyvZr4/exec';

export default function App() {
  const [menu, setMenu] = useState<Drink[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const response = await fetch(API_URL);
      const data: ApiResponse = await response.json();
      setMenu(data.menu || []);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleOrderSubmit = () => {
    setEditingOrder(null);
    fetchData(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
  };

  const handleDelete = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    fetchData(true);
  };

  const totalAmount = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalQty = orders.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F9FA] text-[#2D3436] font-sans overflow-hidden" id="app-root">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#E9ECEF] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4A69BD] rounded-lg flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
            <Coffee size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1E272E]">Office Tea Break</h1>
            <p className="text-xs text-[#7F8C8D] uppercase tracking-widest font-semibold">Order Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] text-[#7F8C8D] uppercase font-bold">Today's Total</p>
              <p className="text-lg font-bold text-[#4A69BD]">${totalAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#7F8C8D] uppercase font-bold">Total Orders</p>
              <p className="text-lg font-bold text-[#4A69BD]">{orders.length}</p>
            </div>
          </div>
          
          <button 
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`p-2 rounded-full transition-all ${
              isRefreshing ? 'bg-blue-50 text-[#4A69BD]' : 'hover:bg-gray-100 text-[#7F8C8D] hover:text-[#4A69BD]'
            }`}
            id="refresh-data-btn"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#4A69BD]/20 border-t-[#4A69BD] rounded-full animate-spin" />
          <p className="text-[#7F8C8D] font-medium tracking-wide">Initializing system data...</p>
        </div>
      ) : (
        <main className="flex flex-1 overflow-hidden p-6 gap-6">
          {/* Sidebar: Menu Selection */}
          <section className="w-72 bg-white rounded-xl border border-[#E9ECEF] flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E9ECEF] bg-[#F1F2F6]">
              <h2 className="font-bold text-sm uppercase text-[#2F3542] tracking-wider">Beverage Menu</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {menu.map((item, index) => (
                <div 
                  key={`${item.name}-${index}`} 
                  className="p-3 hover:bg-[#F1F2F6] rounded text-sm text-[#57606F] flex justify-between cursor-pointer transition-colors group"
                >
                  <span className="font-medium group-hover:text-[#4A69BD]">{item.name}</span>
                  <span className="text-[#7F8C8D] group-hover:text-[#4A69BD]">${item.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Right Area: Form & List */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Order Form Card */}
            <OrderForm 
              menu={menu} 
              editingOrder={editingOrder}
              onCancelEdit={() => setEditingOrder(null)}
              onSubmit={handleOrderSubmit}
              isLoading={isRefreshing}
            />

            {/* Order List Table */}
            <OrderList 
              orders={orders} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isRefreshing}
            />
          </div>
        </main>
      )}

      {/* Footer: Connectivity State */}
      <footer className="px-8 py-2 bg-[#1E272E] text-white flex items-center justify-between text-[10px] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 opacity-80">
            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-[#2ECC71]'}`}></div> 
            {isRefreshing ? 'Syncing with GAS Server...' : 'Connected to GAS Server'}
          </span>
          <span className="opacity-40 uppercase tracking-widest">
            Last sync: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="flex gap-4 opacity-40 uppercase tracking-widest">
          <span>Office Teatime v2.4.0</span>
          <span>Support: #4040</span>
        </div>
      </footer>
    </div>
  );
}
