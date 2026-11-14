import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trend: string;
  trendType: 'positive' | 'warning' | 'neutral' | 'danger';
  icon: string;
  route: string;
}

export interface RecentPurchaseOrder {
  poNumber: string;
  supplierName: string;
  supplierCode: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: 'Draft' | 'Approved' | 'Partially Received' | 'Received';
}

export interface RecentPayment {
  paymentNumber: string;
  poNumber: string;
  supplierName: string;
  paymentDate: string;
  method: string;
  amount: number;
  status: 'Completed' | 'Pending Clearing';
}

export interface StockAlertItem {
  id: number;
  name: string;
  code: string;
  type: 'Material' | 'Product';
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  alertType: 'Out of Stock' | 'Low Stock' | 'Expiring Soon';
  expiryInfo?: string;
  route: string;
}

export interface RecentBatchItem {
  batchNumber: string;
  productName: string;
  sku: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  // Active tab in the main ledger card ('po' | 'payments')
  activeLedgerTab = signal<'po' | 'payments'>('po');

  // Active filter in the alerts panel ('All' | 'Material' | 'Product')
  alertFilter = signal<'All' | 'Material' | 'Product'>('All');

  // ── 4 Top-Level KPI Cards ─────────────────────────────────────────────────
  readonly kpis: DashboardKpi[] = [
    {
      id: 'catalog-stock',
      label: 'Finished Goods Stock',
      value: '2,250 units',
      subtext: '12 active SKUs · 18 production batches',
      trend: '+8.4% this month',
      trendType: 'positive',
      icon: 'bi-box2-fill',
      route: '/products'
    },
    {
      id: 'raw-materials',
      label: 'Raw Material Inventory',
      value: '$48,920.00',
      subtext: '12 catalog materials · 6 categories',
      trend: '3 items need attention',
      trendType: 'warning',
      icon: 'bi-boxes',
      route: '/materials'
    },
    {
      id: 'open-pos',
      label: 'Active Purchase Orders',
      value: '$18,907.50',
      subtext: '8 purchase orders · 10 active suppliers',
      trend: '4 awaiting delivery',
      trendType: 'neutral',
      icon: 'bi-cart-check-fill',
      route: '/purchase-orders'
    },
    {
      id: 'supplier-settlements',
      label: 'Supplier Payments Settled',
      value: '$12,485.00',
      subtext: '8 completed · 2 pending bank clearing',
      trend: '$6,422.50 balance due',
      trendType: 'positive',
      icon: 'bi-credit-card-2-front-fill',
      route: '/purchase-payments'
    }
  ];

  // ── Recent Purchase Orders ────────────────────────────────────────────────
  readonly recentPurchaseOrders: RecentPurchaseOrder[] = [
    {
      poNumber: 'PO-2026-008',
      supplierName: 'Pacific Surfactants',
      supplierCode: 'SUP-006',
      orderDate: '2026-03-11',
      expectedDate: '2026-03-25',
      totalAmount: 1620.00,
      status: 'Approved'
    },
    {
      poNumber: 'PO-2026-007',
      supplierName: 'Jeju Green Extracts',
      supplierCode: 'SUP-010',
      orderDate: '2026-03-08',
      expectedDate: '2026-03-22',
      totalAmount: 2480.00,
      status: 'Partially Received'
    },
    {
      poNumber: 'PO-2026-006',
      supplierName: 'BioActive Labs Inc.',
      supplierCode: 'SUP-007',
      orderDate: '2026-03-04',
      expectedDate: '2026-03-18',
      totalAmount: 3125.00,
      status: 'Approved'
    },
    {
      poNumber: 'PO-2026-005',
      supplierName: 'Maison Arôme SAS',
      supplierCode: 'SUP-005',
      orderDate: '2026-03-01',
      expectedDate: '2026-03-15',
      totalAmount: 2100.00,
      status: 'Received'
    },
    {
      poNumber: 'PO-2026-004',
      supplierName: 'GlassCraft Packaging',
      supplierCode: 'SUP-004',
      orderDate: '2026-02-25',
      expectedDate: '2026-03-10',
      totalAmount: 1750.00,
      status: 'Partially Received'
    }
  ];

  // ── Recent Supplier Payments ──────────────────────────────────────────────
  readonly recentPayments: RecentPayment[] = [
    {
      paymentNumber: 'PAY-2026-009',
      poNumber: 'PO-2026-007',
      supplierName: 'Jeju Green Extracts',
      paymentDate: '2026-03-12',
      method: 'Bank Transfer',
      amount: 1240.00,
      status: 'Completed'
    },
    {
      paymentNumber: 'PAY-2026-008',
      poNumber: 'PO-2026-006',
      supplierName: 'BioActive Labs Inc.',
      paymentDate: '2026-03-09',
      method: 'Letter of Credit',
      amount: 3125.00,
      status: 'Pending Clearing'
    },
    {
      paymentNumber: 'PAY-2026-007',
      poNumber: 'PO-2026-005',
      supplierName: 'Maison Arôme SAS',
      paymentDate: '2026-03-06',
      method: 'Bank Transfer',
      amount: 2100.00,
      status: 'Completed'
    },
    {
      paymentNumber: 'PAY-2026-006',
      poNumber: 'PO-2026-004',
      supplierName: 'GlassCraft Packaging',
      paymentDate: '2026-03-03',
      method: 'Cheque',
      amount: 875.00,
      status: 'Pending Clearing'
    },
    {
      paymentNumber: 'PAY-2026-005',
      poNumber: 'PO-2026-002',
      supplierName: 'Atlas Botanicals Co.',
      paymentDate: '2026-02-28',
      method: 'Corporate Card',
      amount: 1800.00,
      status: 'Completed'
    }
  ];

  // ── Inventory & Batch Alerts (Low Stock / Out of Stock / Expiry) ──────────
  readonly stockAlerts: StockAlertItem[] = [
    {
      id: 1,
      name: 'Bakuchiol Botanical Retinol Alternative',
      code: 'RM-ACT-009',
      type: 'Material',
      category: 'Active Ingredients',
      currentStock: 0,
      minStock: 5,
      unit: 'kg',
      alertType: 'Out of Stock',
      route: '/materials'
    },
    {
      id: 2,
      name: 'Charcoal Detoxifying Clay Mask',
      code: 'PRD-SKN-008',
      type: 'Product',
      category: 'Facial Skincare',
      currentStock: 0,
      minStock: 40,
      unit: 'units',
      alertType: 'Out of Stock',
      route: '/products'
    },
    {
      id: 3,
      name: 'French Lavender Essential Oil',
      code: 'RM-FRG-005',
      type: 'Material',
      category: 'Fragrances & Oils',
      currentStock: 6,
      minStock: 10,
      unit: 'L',
      alertType: 'Low Stock',
      route: '/materials'
    },
    {
      id: 4,
      name: 'Niacinamide (Vitamin B3) Powder',
      code: 'RM-ACT-003',
      type: 'Material',
      category: 'Active Ingredients',
      currentStock: 12,
      minStock: 15,
      unit: 'kg',
      alertType: 'Low Stock',
      route: '/materials'
    }
  ];

  filteredAlerts = computed(() => {
    const f = this.alertFilter();
    if (f === 'All') return this.stockAlerts;
    return this.stockAlerts.filter(a => a.type === f);
  });

  // ── Recent Production Batches & Lot Status ────────────────────────────────
  readonly recentBatches: RecentBatchItem[] = [
    {
      batchNumber: 'BAT-2026-018',
      productName: 'Velvet Matte Weightless Foundation',
      sku: 'PRD-MAK-009',
      mfgDate: '2026-03-01',
      expiryDate: '2027-09-01',
      quantity: 75,
      unit: 'units',
      status: 'Active'
    },
    {
      batchNumber: 'BAT-2026-014',
      productName: 'Rosewater Hydrating Face Mist',
      sku: 'PRD-SKN-001',
      mfgDate: '2026-02-15',
      expiryDate: '2027-08-15',
      quantity: 150,
      unit: 'units',
      status: 'Active'
    },
    {
      batchNumber: 'BAT-2025-088',
      productName: 'Tinted Peptide Overnight Lip Mask',
      sku: 'PRD-LIP-008',
      mfgDate: '2025-05-10',
      expiryDate: '2026-05-10',
      quantity: 25,
      unit: 'units',
      status: 'Expiring Soon'
    }
  ];

  setLedgerTab(tab: 'po' | 'payments'): void {
    this.activeLedgerTab.set(tab);
  }

  setAlertFilter(filter: 'All' | 'Material' | 'Product'): void {
    this.alertFilter.set(filter);
  }

  poStatusClass(status: RecentPurchaseOrder['status']): string {
    switch (status) {
      case 'Received':           return 'status-received';
      case 'Partially Received': return 'status-partial';
      case 'Approved':           return 'status-approved';
      default:                   return 'status-draft';
    }
  }

  alertBadgeClass(alertType: StockAlertItem['alertType']): string {
    switch (alertType) {
      case 'Out of Stock':  return 'alert-out';
      case 'Low Stock':     return 'alert-low';
      case 'Expiring Soon': return 'alert-expiring';
    }
  }

  batchStatusClass(status: RecentBatchItem['status']): string {
    switch (status) {
      case 'Active':        return 'status-received';
      case 'Expiring Soon': return 'status-partial';
      case 'Expired':       return 'alert-out';
    }
  }
}
