import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export type PurchaseOrderStatus =
  | 'Draft'
  | 'Approved'
  | 'Partially Received'
  | 'Received'
  | 'Cancelled';

export interface PurchaseOrderItem {
  materialCode: string;
  materialName: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
}

export interface GoodsReceiptEntry {
  grnNumber: string;
  materialCode: string;
  materialName: string;
  unit: string;
  receivedQty: number;
  unitPrice: number;
  receivedDate: string;
  expiryDate?: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierCode: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  paymentTerms: string;
  status: PurchaseOrderStatus;
  notes?: string;
  items: PurchaseOrderItem[];
  receipts: GoodsReceiptEntry[];
}

export interface PurchaseOrderFormItem {
  materialCode: string;
  materialName: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
}

export interface PurchaseOrderFormData {
  poNumber: string;
  supplierCode: string;
  orderDate: string;
  expectedDate: string;
  paymentTerms: string;
  status: 'Draft' | 'Approved' | 'Cancelled';
  notes: string;
  items: PurchaseOrderFormItem[];
}

export interface ReceiveLineItem {
  materialCode: string;
  materialName: string;
  unit: string;
  orderedQty: number;
  alreadyReceived: number;
  receiveNow: number;
  unitPrice: number;
  expiryDate: string;
}

interface CatalogSupplier {
  code: string;
  name: string;
  paymentTerms: string;
}

interface CatalogMaterial {
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
}

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent {

  // ── Reference Catalogs (Suppliers & Raw Materials) ────────────────────────
  readonly suppliersCatalog: CatalogSupplier[] = [
    { code: 'SUP-001', name: 'Shea Naturals Ltd.',      paymentTerms: 'Net 30' },
    { code: 'SUP-002', name: 'ChemActive Supplies',     paymentTerms: 'Net 45' },
    { code: 'SUP-003', name: 'Pure Glycerin Co.',       paymentTerms: 'Net 30' },
    { code: 'SUP-004', name: 'Rose Valley Aromatics',   paymentTerms: 'Advance Payment' },
    { code: 'SUP-005', name: 'Herbal Lanka Extracts',   paymentTerms: 'Net 15' },
    { code: 'SUP-006', name: 'ColorTech Pigments',      paymentTerms: 'Net 60' },
    { code: 'SUP-007', name: 'Amber Glass Packaging',   paymentTerms: 'Net 45' },
    { code: 'SUP-008', name: 'PrintPro Labels',         paymentTerms: 'Cash on Delivery' }
  ];

  readonly materialsCatalog: CatalogMaterial[] = [
    { code: 'RM-OBW-001', name: 'Organic Shea Butter (Unrefined)',   unit: 'kg',  defaultPrice: 14.50 },
    { code: 'RM-ACT-002', name: 'Niacinamide (Pure Powder 99%)',     unit: 'kg',  defaultPrice: 48.00 },
    { code: 'RM-SRF-003', name: 'Cocamidopropyl Betaine (30%)',      unit: 'L',   defaultPrice: 3.80 },
    { code: 'RM-FRG-004', name: 'Bulgarian Rose Essential Oil',      unit: 'L',   defaultPrice: 420.00 },
    { code: 'RM-EMU-005', name: 'Cetearyl Alcohol (Flakes)',         unit: 'kg',  defaultPrice: 6.20 },
    { code: 'RM-ACT-006', name: 'Hyaluronic Acid (High MW)',         unit: 'g',   defaultPrice: 1.25 },
    { code: 'RM-COL-007', name: 'Cosmetic Iron Oxide (Red 101)',     unit: 'kg',  defaultPrice: 22.00 },
    { code: 'RM-BOT-008', name: 'Centella Asiatica Extract (10:1)',  unit: 'L',   defaultPrice: 62.00 },
    { code: 'RM-HUM-009', name: 'Vegetable Glycerin (USP Grade)',    unit: 'L',   defaultPrice: 2.40 },
    { code: 'RM-PRS-010', name: 'Phenoxyethanol (Preservative)',     unit: 'L',   defaultPrice: 18.50 },
    { code: 'PM-PKG-012', name: 'Amber Glass Dropper Bottle (30ml)', unit: 'pcs', defaultPrice: 0.35 }
  ];

  readonly paymentTermsList: string[] = [
    'Cash on Delivery',
    'Advance Payment',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60'
  ];

  readonly statusFilters: string[] = [
    'All',
    'Draft',
    'Approved',
    'Partially Received',
    'Received',
    'Cancelled'
  ];

  // ── Filter & Pagination State ─────────────────────────────────────────────
  searchQuery    = signal('');
  supplierFilter = signal('All');
  statusFilter   = signal('All');
  currentPage    = signal(1);
  pageSize       = signal(5);

  // ── Create / Edit PO Modal State ──────────────────────────────────────────
  showModal     = signal(false);
  isEditMode    = signal(false);
  selectedPO    = signal<PurchaseOrder | null>(null);
  itemsPage     = signal(1);
  itemsPageSize = signal(1);
  formData: PurchaseOrderFormData = this.emptyForm();

  // ── Receive Stock (GRN) Modal State ───────────────────────────────────────
  showReceiveModal = signal(false);
  receivingPO      = signal<PurchaseOrder | null>(null);
  receivePage      = signal(1);
  receivePageSize  = signal(1);
  receiveItems: ReceiveLineItem[] = [];

  // ── View PO Details Modal State ───────────────────────────────────────────
  showViewModal        = signal(false);
  viewingPO            = signal<PurchaseOrder | null>(null);
  viewItemsPage        = signal(1);
  viewItemsPageSize    = signal(1);
  viewReceiptsPage     = signal(1);
  viewReceiptsPageSize = signal(1);
  private grnSeq = 7;

  // ── Initial Mock Dataset (10 Purchase Orders) ─────────────────────────────
  purchaseOrders = signal<PurchaseOrder[]>([
    {
      id: 1,
      poNumber: 'PO-2026-001',
      supplierCode: 'SUP-001',
      supplierName: 'Shea Naturals Ltd.',
      orderDate: '2026-02-05',
      expectedDate: '2026-02-14',
      paymentTerms: 'Net 30',
      status: 'Received',
      notes: 'Cold-pressed unrefined organic lot (delivered in 2 shipments)',
      items: [
        { materialCode: 'RM-OBW-001', materialName: 'Organic Shea Butter (Unrefined)', unit: 'kg', orderedQty: 200, receivedQty: 200, unitPrice: 14.20 }
      ],
      receipts: [
        { grnNumber: 'GRN-0001', materialCode: 'RM-OBW-001', materialName: 'Organic Shea Butter (Unrefined)', unit: 'kg', receivedQty: 120, unitPrice: 14.20, receivedDate: '2026-02-10', expiryDate: '2027-06-30' },
        { grnNumber: 'GRN-0002', materialCode: 'RM-OBW-001', materialName: 'Organic Shea Butter (Unrefined)', unit: 'kg', receivedQty: 80,  unitPrice: 14.20, receivedDate: '2026-02-14', expiryDate: '2027-08-31' }
      ]
    },
    {
      id: 2,
      poNumber: 'PO-2026-002',
      supplierCode: 'SUP-002',
      supplierName: 'ChemActive Supplies',
      orderDate: '2026-02-10',
      expectedDate: '2026-02-18',
      paymentTerms: 'Net 45',
      status: 'Received',
      notes: 'Include COA and MSDS documents',
      items: [
        { materialCode: 'RM-ACT-002', materialName: 'Niacinamide (Pure Powder 99%)', unit: 'kg', orderedQty: 25,  receivedQty: 25,  unitPrice: 49.00 },
        { materialCode: 'RM-EMU-005', materialName: 'Cetearyl Alcohol (Flakes)',     unit: 'kg', orderedQty: 100, receivedQty: 100, unitPrice: 6.20 }
      ],
      receipts: [
        { grnNumber: 'GRN-0003', materialCode: 'RM-ACT-002', materialName: 'Niacinamide (Pure Powder 99%)', unit: 'kg', receivedQty: 25,  unitPrice: 49.00, receivedDate: '2026-02-18', expiryDate: '2027-09-30' },
        { grnNumber: 'GRN-0003', materialCode: 'RM-EMU-005', materialName: 'Cetearyl Alcohol (Flakes)',     unit: 'kg', receivedQty: 100, unitPrice: 6.20,  receivedDate: '2026-02-18', expiryDate: '2027-10-15' }
      ]
    },
    {
      id: 3,
      poNumber: 'PO-2026-003',
      supplierCode: 'SUP-003',
      supplierName: 'Pure Glycerin Co.',
      orderDate: '2026-03-01',
      expectedDate: '2026-03-10',
      paymentTerms: 'Net 30',
      status: 'Received',
      items: [
        { materialCode: 'RM-HUM-009', materialName: 'Vegetable Glycerin (USP Grade)', unit: 'L', orderedQty: 600, receivedQty: 600, unitPrice: 2.35 }
      ],
      receipts: [
        { grnNumber: 'GRN-0004', materialCode: 'RM-HUM-009', materialName: 'Vegetable Glycerin (USP Grade)', unit: 'L', receivedQty: 600, unitPrice: 2.35, receivedDate: '2026-03-10', expiryDate: '2028-03-10' }
      ]
    },
    {
      id: 4,
      poNumber: 'PO-2026-004',
      supplierCode: 'SUP-004',
      supplierName: 'Rose Valley Aromatics',
      orderDate: '2026-03-12',
      expectedDate: '2026-03-25',
      paymentTerms: 'Advance Payment',
      status: 'Partially Received',
      notes: 'First air-freight batch received; remaining 5L en route',
      items: [
        { materialCode: 'RM-FRG-004', materialName: 'Bulgarian Rose Essential Oil', unit: 'L', orderedQty: 10, receivedQty: 5, unitPrice: 415.00 }
      ],
      receipts: [
        { grnNumber: 'GRN-0005', materialCode: 'RM-FRG-004', materialName: 'Bulgarian Rose Essential Oil', unit: 'L', receivedQty: 5, unitPrice: 415.00, receivedDate: '2026-03-21', expiryDate: '2028-03-31' }
      ]
    },
    {
      id: 5,
      poNumber: 'PO-2026-005',
      supplierCode: 'SUP-005',
      supplierName: 'Herbal Lanka Extracts',
      orderDate: '2026-03-18',
      expectedDate: '2026-03-28',
      paymentTerms: 'Net 15',
      status: 'Approved',
      notes: 'Standardized 10:1 botanical extract',
      items: [
        { materialCode: 'RM-BOT-008', materialName: 'Centella Asiatica Extract (10:1)', unit: 'L', orderedQty: 40, receivedQty: 0, unitPrice: 60.00 }
      ],
      receipts: []
    },
    {
      id: 6,
      poNumber: 'PO-2026-006',
      supplierCode: 'SUP-007',
      supplierName: 'Amber Glass Packaging',
      orderDate: '2026-03-20',
      expectedDate: '2026-04-05',
      paymentTerms: 'Net 45',
      status: 'Partially Received',
      notes: 'Palletized glass bottles with black dropper caps',
      items: [
        { materialCode: 'PM-PKG-012', materialName: 'Amber Glass Dropper Bottle (30ml)', unit: 'pcs', orderedQty: 5000, receivedQty: 3000, unitPrice: 0.34 }
      ],
      receipts: [
        { grnNumber: 'GRN-0006', materialCode: 'PM-PKG-012', materialName: 'Amber Glass Dropper Bottle (30ml)', unit: 'pcs', receivedQty: 3000, unitPrice: 0.34, receivedDate: '2026-03-29' }
      ]
    },
    {
      id: 7,
      poNumber: 'PO-2026-007',
      supplierCode: 'SUP-001',
      supplierName: 'Shea Naturals Ltd.',
      orderDate: '2026-03-24',
      expectedDate: '2026-04-02',
      paymentTerms: 'Net 30',
      status: 'Approved',
      items: [
        { materialCode: 'RM-OBW-001', materialName: 'Organic Shea Butter (Unrefined)', unit: 'kg', orderedQty: 150, receivedQty: 0, unitPrice: 14.60 }
      ],
      receipts: []
    },
    {
      id: 8,
      poNumber: 'PO-2026-008',
      supplierCode: 'SUP-002',
      supplierName: 'ChemActive Supplies',
      orderDate: '2026-03-26',
      expectedDate: '2026-04-08',
      paymentTerms: 'Net 45',
      status: 'Draft',
      notes: 'Q2 serum formulation restock',
      items: [
        { materialCode: 'RM-ACT-006', materialName: 'Hyaluronic Acid (High MW)',     unit: 'g', orderedQty: 1000, receivedQty: 0, unitPrice: 1.20 },
        { materialCode: 'RM-PRS-010', materialName: 'Phenoxyethanol (Preservative)', unit: 'L', orderedQty: 50,   receivedQty: 0, unitPrice: 18.00 }
      ],
      receipts: []
    },
    {
      id: 9,
      poNumber: 'PO-2026-009',
      supplierCode: 'SUP-006',
      supplierName: 'ColorTech Pigments',
      orderDate: '2026-03-27',
      expectedDate: '2026-04-12',
      paymentTerms: 'Net 60',
      status: 'Draft',
      items: [
        { materialCode: 'RM-COL-007', materialName: 'Cosmetic Iron Oxide (Red 101)', unit: 'kg', orderedQty: 40, receivedQty: 0, unitPrice: 21.50 }
      ],
      receipts: []
    },
    {
      id: 10,
      poNumber: 'PO-2026-010',
      supplierCode: 'SUP-008',
      supplierName: 'PrintPro Labels',
      orderDate: '2026-03-15',
      expectedDate: '2026-03-22',
      paymentTerms: 'Cash on Delivery',
      status: 'Cancelled',
      notes: 'Cancelled due to artwork revision',
      items: [
        { materialCode: 'RM-SRF-003', materialName: 'Cocamidopropyl Betaine (30%)', unit: 'L', orderedQty: 120, receivedQty: 0, unitPrice: 3.80 }
      ],
      receipts: []
    }
  ]);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredOrders = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const sup = this.supplierFilter();
    const status = this.statusFilter();

    return this.purchaseOrders().filter(po => {
      const matchSearch = !q ||
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.supplierCode.toLowerCase().includes(q) ||
        po.items.some(i => i.materialName.toLowerCase().includes(q) || i.materialCode.toLowerCase().includes(q));

      const matchSup = sup === 'All' || po.supplierCode === sup;
      const matchStatus = status === 'All' || po.status === status;

      return matchSearch && matchSup && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredOrders().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredOrders().length)
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  private round2(v: number): number {
    return Math.round(v * 100) / 100;
  }

  private todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  private nextPoNumber(): string {
    const list = this.purchaseOrders?.() ?? [];
    const maxNum = list.reduce((max, po) => {
      const parts = po.poNumber.split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return `PO-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }

  private emptyFormItem(): PurchaseOrderFormItem {
    const firstMat = this.materialsCatalog[0];
    return {
      materialCode: firstMat.code,
      materialName: firstMat.name,
      unit: firstMat.unit,
      orderedQty: 10,
      receivedQty: 0,
      unitPrice: firstMat.defaultPrice
    };
  }

  private emptyForm(): PurchaseOrderFormData {
    const firstSup = this.suppliersCatalog[0];
    const today = this.todayIso();
    return {
      poNumber: this.nextPoNumber(),
      supplierCode: firstSup.code,
      orderDate: today,
      expectedDate: today,
      paymentTerms: firstSup.paymentTerms,
      status: 'Draft',
      notes: '',
      items: [this.emptyFormItem()]
    };
  }

  orderTotal(po: PurchaseOrder): number {
    return this.round2(
      po.items.reduce((sum, item) => sum + item.orderedQty * item.unitPrice, 0)
    );
  }

  formTotal(): number {
    return this.round2(
      this.formData.items.reduce(
        (sum, item) => sum + (Number(item.orderedQty) || 0) * (Number(item.unitPrice) || 0),
        0
      )
    );
  }

  itemsTotalPages(): number {
    return Math.max(1, Math.ceil(this.formData.items.length / this.itemsPageSize()));
  }

  itemsPageNumbers(): number[] {
    return Array.from({ length: this.itemsTotalPages() }, (_, i) => i + 1);
  }

  pagedFormItems(): PurchaseOrderFormItem[] {
    const size = this.itemsPageSize();
    const start = (this.itemsPage() - 1) * size;
    return this.formData.items.slice(start, start + size);
  }

  itemsShowingFrom(): number {
    return this.formData.items.length === 0 ? 0 : (this.itemsPage() - 1) * this.itemsPageSize() + 1;
  }

  itemsShowingTo(): number {
    return Math.min(this.itemsPage() * this.itemsPageSize(), this.formData.items.length);
  }

  lineIndex(pageRowIndex: number): number {
    return (this.itemsPage() - 1) * this.itemsPageSize() + pageRowIndex;
  }

  goToItemsPage(page: number): void {
    if (page >= 1 && page <= this.itemsTotalPages()) {
      this.itemsPage.set(page);
    }
  }

  // Receive Stock Modal Pagination Helpers
  receiveTotalPages(): number {
    return Math.max(1, Math.ceil(this.receiveItems.length / this.receivePageSize()));
  }

  receivePageNumbers(): number[] {
    return Array.from({ length: this.receiveTotalPages() }, (_, i) => i + 1);
  }

  pagedReceiveItems(): ReceiveLineItem[] {
    const size = this.receivePageSize();
    const start = (this.receivePage() - 1) * size;
    return this.receiveItems.slice(start, start + size);
  }

  receiveShowingFrom(): number {
    return this.receiveItems.length === 0 ? 0 : (this.receivePage() - 1) * this.receivePageSize() + 1;
  }

  receiveShowingTo(): number {
    return Math.min(this.receivePage() * this.receivePageSize(), this.receiveItems.length);
  }

  receiveLineIndex(pageRowIndex: number): number {
    return (this.receivePage() - 1) * this.receivePageSize() + pageRowIndex;
  }

  goToReceivePage(page: number): void {
    if (page >= 1 && page <= this.receiveTotalPages()) {
      this.receivePage.set(page);
    }
  }

  // View PO Details Modal Pagination Helpers (Ordered Items & Goods Receipts)
  viewItemsTotalPages(): number {
    const len = this.viewingPO()?.items.length ?? 0;
    return Math.max(1, Math.ceil(len / this.viewItemsPageSize()));
  }

  viewItemsPageNumbers(): number[] {
    return Array.from({ length: this.viewItemsTotalPages() }, (_, i) => i + 1);
  }

  pagedViewItems(): PurchaseOrderItem[] {
    const items = this.viewingPO()?.items ?? [];
    const size = this.viewItemsPageSize();
    const start = (this.viewItemsPage() - 1) * size;
    return items.slice(start, start + size);
  }

  viewItemsShowingFrom(): number {
    const len = this.viewingPO()?.items.length ?? 0;
    return len === 0 ? 0 : (this.viewItemsPage() - 1) * this.viewItemsPageSize() + 1;
  }

  viewItemsShowingTo(): number {
    const len = this.viewingPO()?.items.length ?? 0;
    return Math.min(this.viewItemsPage() * this.viewItemsPageSize(), len);
  }

  goToViewItemsPage(page: number): void {
    if (page >= 1 && page <= this.viewItemsTotalPages()) {
      this.viewItemsPage.set(page);
    }
  }

  viewReceiptsTotalPages(): number {
    const len = this.viewingPO()?.receipts.length ?? 0;
    return Math.max(1, Math.ceil(len / this.viewReceiptsPageSize()));
  }

  viewReceiptsPageNumbers(): number[] {
    return Array.from({ length: this.viewReceiptsTotalPages() }, (_, i) => i + 1);
  }

  pagedViewReceipts(): GoodsReceiptEntry[] {
    const receipts = this.viewingPO()?.receipts ?? [];
    const size = this.viewReceiptsPageSize();
    const start = (this.viewReceiptsPage() - 1) * size;
    return receipts.slice(start, start + size);
  }

  viewReceiptsShowingFrom(): number {
    const len = this.viewingPO()?.receipts.length ?? 0;
    return len === 0 ? 0 : (this.viewReceiptsPage() - 1) * this.viewReceiptsPageSize() + 1;
  }

  viewReceiptsShowingTo(): number {
    const len = this.viewingPO()?.receipts.length ?? 0;
    return Math.min(this.viewReceiptsPage() * this.viewReceiptsPageSize(), len);
  }

  goToViewReceiptsPage(page: number): void {
    if (page >= 1 && page <= this.viewReceiptsTotalPages()) {
      this.viewReceiptsPage.set(page);
    }
  }

  itemsSummary(po: PurchaseOrder): string {
    if (po.items.length === 0) return '—';
    const first = po.items[0].materialName;
    return po.items.length === 1 ? first : `${first} +${po.items.length - 1} more`;
  }

  statusBadgeClass(status: PurchaseOrderStatus): string {
    switch (status) {
      case 'Draft':              return 'po-status-draft';
      case 'Approved':           return 'po-status-approved';
      case 'Partially Received': return 'po-status-partial';
      case 'Received':           return 'po-status-received';
      case 'Cancelled':          return 'po-status-cancelled';
    }
  }

  canReceive(po: PurchaseOrder): boolean {
    return po.status === 'Approved' || po.status === 'Partially Received';
  }

  canEdit(po: PurchaseOrder): boolean {
    return po.status === 'Draft' || po.status === 'Approved';
  }

  canDelete(po: PurchaseOrder): boolean {
    return po.status === 'Draft' || po.status === 'Approved' || po.status === 'Cancelled';
  }

  private focusGroupInput(event?: Event): void {
    const btn = event?.currentTarget as HTMLElement | null;
    const input = btn?.closest('.input-group')?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  }

  // ── Filter & Pagination Actions ───────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setSupplierFilter(sup: string): void {
    this.supplierFilter.set(sup);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── Create / Edit PO Modal Actions ────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedPO.set(null);
    this.formData = this.emptyForm();
    this.itemsPage.set(1);
    this.showModal.set(true);
  }

  openEditModal(po: PurchaseOrder): void {
    this.isEditMode.set(true);
    this.selectedPO.set(po);
    this.formData = {
      poNumber: po.poNumber,
      supplierCode: po.supplierCode,
      orderDate: po.orderDate,
      expectedDate: po.expectedDate,
      paymentTerms: po.paymentTerms,
      status: po.status === 'Cancelled' ? 'Cancelled' : po.status === 'Approved' ? 'Approved' : 'Draft',
      notes: po.notes ?? '',
      items: po.items.map(i => ({ ...i }))
    };
    this.itemsPage.set(1);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    const po = this.selectedPO();
    if (this.isEditMode() && po) {
      this.openEditModal(po);
    } else {
      this.formData = this.emptyForm();
      this.itemsPage.set(1);
    }
  }

  onSupplierChange(supplierCode: string): void {
    const sup = this.suppliersCatalog.find(s => s.code === supplierCode);
    if (sup) {
      this.formData.paymentTerms = sup.paymentTerms;
    }
  }

  onLineMaterialChange(index: number, materialCode: string): void {
    const mat = this.materialsCatalog.find(m => m.code === materialCode);
    if (!mat) return;
    const line = this.formData.items[index];
    line.materialCode = mat.code;
    line.materialName = mat.name;
    line.unit = mat.unit;
    line.unitPrice = mat.defaultPrice;
  }

  addLineItem(): void {
    this.formData.items = [...this.formData.items, this.emptyFormItem()];
    this.itemsPage.set(this.itemsTotalPages());
  }

  removeLineItem(index: number): void {
    if (this.formData.items.length <= 1) return;
    this.formData.items = this.formData.items.filter((_, i) => i !== index);
    if (this.itemsPage() > this.itemsTotalPages()) {
      this.itemsPage.set(this.itemsTotalPages());
    }
  }

  adjustLineQty(index: number, delta: number, event?: Event): void {
    const line = this.formData.items[index];
    line.orderedQty = Math.max(1, this.round2((Number(line.orderedQty) || 0) + delta));
    this.focusGroupInput(event);
  }

  adjustLinePrice(index: number, delta: number, event?: Event): void {
    const line = this.formData.items[index];
    line.unitPrice = Math.max(0, this.round2((Number(line.unitPrice) || 0) + delta));
    this.focusGroupInput(event);
  }

  savePurchaseOrder(): void {
    const poNumber = this.formData.poNumber.trim().toUpperCase();
    const supplier = this.suppliersCatalog.find(s => s.code === this.formData.supplierCode);

    if (!poNumber) {
      alert('PO number is required.');
      return;
    }

    if (!supplier) {
      alert('Please select a supplier.');
      return;
    }

    if (this.formData.items.length === 0) {
      alert('Please add at least one material item.');
      return;
    }

    for (const item of this.formData.items) {
      if ((Number(item.orderedQty) || 0) <= 0) {
        alert(`Ordered quantity for "${item.materialName}" must be greater than 0.`);
        return;
      }
    }

    const editingId = this.isEditMode() ? this.selectedPO()?.id : undefined;
    if (this.purchaseOrders().some(p => p.id !== editingId && p.poNumber.toUpperCase() === poNumber)) {
      alert(`A purchase order with number "${poNumber}" already exists.`);
      return;
    }

    const items: PurchaseOrderItem[] = this.formData.items.map(i => ({
      materialCode: i.materialCode,
      materialName: i.materialName,
      unit: i.unit,
      orderedQty: this.round2(Number(i.orderedQty) || 0),
      receivedQty: i.receivedQty || 0,
      unitPrice: this.round2(Number(i.unitPrice) || 0)
    }));

    if (editingId !== undefined) {
      this.purchaseOrders.update(list =>
        list.map(p =>
          p.id === editingId
            ? {
                ...p,
                poNumber,
                supplierCode: supplier.code,
                supplierName: supplier.name,
                orderDate: this.formData.orderDate,
                expectedDate: this.formData.expectedDate,
                paymentTerms: this.formData.paymentTerms,
                status: this.formData.status,
                notes: this.formData.notes.trim() || undefined,
                items
              }
            : p
        )
      );
    } else {
      const newId = Math.max(0, ...this.purchaseOrders().map(p => p.id)) + 1;
      const newPO: PurchaseOrder = {
        id: newId,
        poNumber,
        supplierCode: supplier.code,
        supplierName: supplier.name,
        orderDate: this.formData.orderDate,
        expectedDate: this.formData.expectedDate,
        paymentTerms: this.formData.paymentTerms,
        status: this.formData.status,
        notes: this.formData.notes.trim() || undefined,
        items,
        receipts: []
      };
      this.purchaseOrders.update(list => [newPO, ...list]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  approvePurchaseOrder(po: PurchaseOrder): void {
    this.purchaseOrders.update(list =>
      list.map(p => (p.id === po.id ? { ...p, status: 'Approved' } : p))
    );
  }

  deletePurchaseOrder(po: PurchaseOrder): void {
    const confirmed = confirm(`Are you sure you want to delete purchase order "${po.poNumber}" (${po.supplierName})?`);
    if (!confirmed) return;

    this.purchaseOrders.update(list => list.filter(p => p.id !== po.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  // ── Receive Stock (GRN) Modal Actions ─────────────────────────────────────
  openReceiveModal(po: PurchaseOrder): void {
    this.receivingPO.set(po);
    this.receiveItems = po.items.map(i => ({
      materialCode: i.materialCode,
      materialName: i.materialName,
      unit: i.unit,
      orderedQty: i.orderedQty,
      alreadyReceived: i.receivedQty,
      receiveNow: Math.max(0, this.round2(i.orderedQty - i.receivedQty)),
      unitPrice: i.unitPrice,
      expiryDate: ''
    }));
    this.receivePage.set(1);
    this.showReceiveModal.set(true);
  }

  closeReceiveModal(): void {
    this.showReceiveModal.set(false);
  }

  resetReceiveForm(): void {
    const po = this.receivingPO();
    if (po) {
      this.openReceiveModal(po);
    }
  }

  adjustReceiveQty(index: number, delta: number, event?: Event): void {
    const item = this.receiveItems[index];
    const remaining = Math.max(0, item.orderedQty - item.alreadyReceived);
    const next = this.round2((Number(item.receiveNow) || 0) + delta);
    item.receiveNow = Math.min(remaining, Math.max(0, next));
    this.focusGroupInput(event);
  }

  saveReceiveStock(): void {
    const po = this.receivingPO();
    if (!po) return;

    const totalReceivingNow = this.receiveItems.reduce((sum, i) => sum + (Number(i.receiveNow) || 0), 0);
    if (totalReceivingNow <= 0) {
      alert('Please enter a received quantity greater than 0 for at least one item.');
      return;
    }

    const today = this.todayIso();
    const grnNumber = `GRN-${String(this.grnSeq++).padStart(4, '0')}`;
    const newReceipts: GoodsReceiptEntry[] = [];

    const updatedItems: PurchaseOrderItem[] = po.items.map((orig, idx) => {
      const rec = this.receiveItems[idx];
      const added = Math.max(0, this.round2(Number(rec.receiveNow) || 0));
      if (added > 0) {
        newReceipts.push({
          grnNumber,
          materialCode: orig.materialCode,
          materialName: orig.materialName,
          unit: orig.unit,
          receivedQty: added,
          unitPrice: orig.unitPrice,
          receivedDate: today,
          expiryDate: rec.expiryDate || undefined
        });
      }
      return {
        ...orig,
        receivedQty: this.round2(orig.receivedQty + added)
      };
    });

    const allReceived = updatedItems.every(i => i.receivedQty >= i.orderedQty);
    const newStatus: PurchaseOrderStatus = allReceived ? 'Received' : 'Partially Received';

    this.purchaseOrders.update(list =>
      list.map(p =>
        p.id === po.id
          ? {
              ...p,
              items: updatedItems,
              receipts: [...p.receipts, ...newReceipts],
              status: newStatus
            }
          : p
      )
    );

    this.closeReceiveModal();
  }

  // ── View PO Details Modal Actions ─────────────────────────────────────────
  openViewModal(po: PurchaseOrder): void {
    this.viewingPO.set(po);
    this.viewItemsPage.set(1);
    this.viewReceiptsPage.set(1);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
  }

  receiveFromView(): void {
    const po = this.viewingPO();
    if (!po) return;
    this.closeViewModal();
    this.openReceiveModal(po);
  }
}

