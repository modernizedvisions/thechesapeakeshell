import React from 'react';
import type { AdminOrder } from '../../lib/db/orders';

interface OrderDetailsModalProps {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
}

const formatCurrency = (cents: number | null | undefined) => {
  const amount = (cents ?? 0) / 100;
  return `$${amount.toFixed(2)}`;
};

export function OrderDetailsModal({ open, order, onClose }: OrderDetailsModalProps) {
  if (!open || !order) return null;

  const idLabel = order.displayOrderId || order.id?.slice(0, 8) || 'Order';
  const placedAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date';
  const customerName = order.shippingName || order.customerName || 'Customer';
  const customerEmail = order.customerEmail || 'No email provided';

  const shipping = order.shippingAddress;
  const hasShipping = !!shipping;

  const items = Array.isArray(order.items) && order.items.length
    ? order.items
    : [{
        productId: 'item',
        productName: 'Item',
        quantity: 1,
        priceCents: order.totalCents || 0,
      }];

  const lineTotal = (qty: number, priceCents: number) => formatCurrency((qty || 0) * (priceCents || 0));
  const shippingCents = order.shippingCents ?? 0;
  const subtotalCents = Math.max((order.totalCents ?? 0) - shippingCents, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-3 py-6">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-slate-100 p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          CLOSE
        </button>

        <div className="space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1">Order</p>
            <div className="text-xl font-semibold text-slate-900">Order {idLabel}</div>
            <p className="text-sm text-slate-600">Placed {placedAt}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">Customer</p>
              <div className="text-sm text-slate-900">{customerName}</div>
              <div className="text-sm text-slate-600">{customerEmail}</div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">Shipping Address</p>
              {hasShipping ? (
                <div className="text-sm text-slate-700 space-y-0.5">
                  {shipping?.line1 && <div>{shipping.line1}</div>}
                  {shipping?.line2 && <div>{shipping.line2}</div>}
                  {(shipping?.city || shipping?.state || shipping?.postal_code) && (
                    <div>
                      {[shipping?.city, shipping?.state, shipping?.postal_code].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {shipping?.country && <div>{shipping.country}</div>}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No shipping address available.</div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Order Status</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-100">
                  Completed
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
                  Paid
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-700 border border-slate-200">
                  {placedAt}
                </span>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Items</p>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName || 'Product'}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {item.productName || item.productId || 'Item'}
                      </div>
                      <div className="text-xs text-slate-600">
                          Qty: {item.quantity || 0} × {formatCurrency(item.priceCents)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {lineTotal(item.quantity, item.priceCents)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Totals</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(subtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-slate-900">{formatCurrency(shippingCents)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.totalCents)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
