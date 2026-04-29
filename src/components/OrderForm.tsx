/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Drink, Order } from '../types';
import { Coffee, User, ShoppingCart, Plus, Edit2, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderFormProps {
  menu: Drink[];
  editingOrder: Order | null;
  onCancelEdit: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbyI-H2tw3aHv-Tqq1SVzjsRWcztPoWGyt63xCn-AmTVtpx6SIZ5wxkmDERUaWyvZr4/exec';

const SUGAR_OPTIONS = ['全糖', '七分糖', '半糖', '三分糖', '無糖'];
const ICE_OPTIONS = ['正常冰', '少冰', '微冰', '去冰', '溫', '熱'];

export default function OrderForm({ menu, editingOrder, onCancelEdit, onSubmit, isLoading }: OrderFormProps) {
  const [formData, setFormData] = useState<Order>({
    name: '',
    drink: '',
    sugar: '半糖',
    ice: '少冰',
    quantity: 1,
    totalPrice: 0,
  });

  useEffect(() => {
    if (editingOrder) {
      setFormData(editingOrder);
    } else {
      setFormData({
        name: '',
        drink: menu.length > 0 ? menu[0].name : '',
        sugar: '半糖',
        ice: '少冰',
        quantity: 1,
        totalPrice: menu.length > 0 ? menu[0].price : 0,
      });
    }
  }, [editingOrder, menu]);

  const handleDrinkChange = (drinkName: string) => {
    const selectedDrink = menu.find(d => d.name === drinkName);
    if (selectedDrink) {
      setFormData(prev => ({
        ...prev,
        drink: drinkName,
        totalPrice: selectedDrink.price * prev.quantity
      }));
    }
  };

  const handleQuantityChange = (q: number) => {
    const selectedDrink = menu.find(d => d.name === formData.drink);
    if (selectedDrink) {
      setFormData(prev => ({
        ...prev,
        quantity: q,
        totalPrice: selectedDrink.price * q
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const action = editingOrder ? 'update' : 'create';
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action,
          data: formData,
        }),
      });

      if (response.ok) {
        onSubmit();
        if (!editingOrder) {
          setFormData({
            ...formData,
            name: '',
            quantity: 1,
            totalPrice: menu.find(d => d.name === formData.drink)?.price || 0
          });
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失敗，請稍後再試。');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-sm" id="order-form-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase text-[#2F3542] tracking-wider">
          {editingOrder ? 'Edit Order Details' : 'New Order Entry'}
        </h2>
        {editingOrder && (
          <button 
            onClick={onCancelEdit}
            className="text-[10px] font-bold text-[#E74C3C] uppercase hover:underline"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">Customer Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm p-2 border border-[#E9ECEF] rounded bg-[#FBFCFD] focus:ring-1 focus:ring-[#4A69BD] outline-none transition-all placeholder:text-gray-300"
                placeholder="e.g. Jason Chen"
                id="input-name"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">Select Beverage</label>
            <select
              value={formData.drink}
              onChange={e => handleDrinkChange(e.target.value)}
              className="w-full text-sm p-2 border border-[#E9ECEF] rounded bg-[#FBFCFD] outline-none cursor-pointer"
              id="select-drink"
            >
              {menu.map((item, index) => (
                <option key={`${item.name}-${index}`} value={item.name}>
                  {item.name} (${item.price})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">Sugar Level</label>
            <select
              value={formData.sugar}
              onChange={e => setFormData({ ...formData, sugar: e.target.value })}
              className="w-full text-sm p-2 border border-[#E9ECEF] rounded bg-[#FBFCFD] outline-none cursor-pointer"
            >
              {SUGAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">Ice Level</label>
            <select
              value={formData.ice}
              onChange={e => setFormData({ ...formData, ice: e.target.value })}
              className="w-full text-sm p-2 border border-[#E9ECEF] rounded bg-[#FBFCFD] outline-none cursor-pointer"
            >
              {ICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">Quantity</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full text-sm p-2 border border-[#E9ECEF] rounded bg-[#FBFCFD] outline-none"
              />
            </div>
          </div>

          <div className="col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className={`w-full bg-[#4A69BD] hover:bg-[#3c55a5] text-white text-[11px] font-bold py-2.5 rounded transition-all tracking-widest uppercase shadow-sm flex items-center justify-center gap-2 ${
                (isLoading || !formData.name) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
              }`}
              id="submit-btn"
            >
              {isLoading && <RefreshCw size={12} className="animate-spin" />}
              {editingOrder ? 'Update Order' : 'Submit Order'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end pt-2">
          <p className="text-[10px] text-[#7F8C8D] uppercase font-bold mr-2">Est. Total:</p>
          <p className="text-sm font-bold text-[#1E272E]">${formData.totalPrice}</p>
        </div>
      </form>
    </section>
  );
}
