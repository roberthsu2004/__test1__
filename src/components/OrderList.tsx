/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Order } from '../types';
import { Trash2, Edit, Clock, User, Coffee, ReceiptText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  isLoading: boolean;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbyI-H2tw3aHv-Tqq1SVzjsRWcztPoWGyt63xCn-AmTVtpx6SIZ5wxkmDERUaWyvZr4/exec';

export default function OrderList({ orders, onEdit, onDelete, isLoading }: OrderListProps) {
  const handleDelete = async (orderId: string) => {
    if (!window.confirm('確定要刪除這筆訂單嗎？')) return;
    
    try {
      // Use text/plain to avoid CORS preflight issues with GAS
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'delete',
          data: { orderId },
        }),
      });

      onDelete(orderId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('刪除失敗，請確認網路連線。');
    }
  };

  return (
    <section className="flex-1 bg-white rounded-xl border border-[#E9ECEF] shadow-sm flex flex-col overflow-hidden" id="order-list-container">
      <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between bg-white sticky top-0 z-10">
        <h2 className="text-sm font-bold uppercase text-[#2F3542] tracking-wider flex items-center gap-2">
          Active Orders <span className="text-[#4A69BD] bg-[#4A69BD]/10 px-2 py-0.5 rounded text-[10px]">{orders.length}</span>
        </h2>
        <span className="px-2 py-1 bg-[#2ECC71]/10 text-[#27AE60] text-[10px] font-bold rounded uppercase tracking-tighter animate-pulse flex items-center gap-1">
          <div className="w-1 h-1 bg-[#2ECC71] rounded-full"></div> Live Sync On
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#7F8C8D]">
            <ReceiptText size={40} className="mb-2 opacity-20" />
            <p className="text-xs uppercase font-bold tracking-widest">No active orders found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F2F6] text-[#7F8C8D] text-[10px] uppercase font-bold sticky top-0 z-10">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Drink</th>
                <th className="px-4 py-3">Pref</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#E9ECEF]">
              <AnimatePresence initial={false}>
                {orders.map((order, index) => (
                  <motion.tr 
                    key={order.orderId || `order-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="hover:bg-[#F8F9FA] transition-colors group"
                  >
                    <td className="px-4 py-3 font-semibold text-[#1E272E]">{order.name}</td>
                    <td className="px-4 py-3 text-[#57606F]">{order.drink}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-[#4A69BD] rounded text-[10px] border border-blue-100">{order.sugar}</span>
                        <span className="px-1.5 py-0.5 bg-gray-50 text-[#7F8C8D] rounded text-[10px] border border-gray-100">{order.ice}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#57606F]">{order.quantity}</td>
                    <td className="px-4 py-3 font-bold text-[#1E272E]">${order.totalPrice}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(order)}
                          className="text-[#4A69BD] text-[11px] font-bold uppercase hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (order.orderId) {
                              handleDelete(order.orderId);
                            } else {
                              console.warn('Order missing ID:', order);
                              alert('無法刪除：這筆訂單缺少編號 (ID)。');
                            }
                          }}
                          className="text-[#E74C3C] text-[11px] font-bold uppercase hover:underline cursor-pointer"
                        >
                          Void
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
