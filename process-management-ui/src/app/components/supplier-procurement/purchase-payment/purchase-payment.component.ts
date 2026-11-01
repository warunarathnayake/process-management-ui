import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Cheque'
  | 'Cash'
  | 'Corporate Card'
  | 'Letter of Credit';

export type PurchasePaymentStatus =
  | 'Completed'
  | 'Pending Clearing'
  | 'Voided';

export interface PurchaseOrderRef {
  poNumber: string;
  supplierCode: string;
  supplierName: string;
  paymentTerms: string;
  orderDate: string;
  totalAmount: number;
}

export interface PurchasePayment {
  id: number;
  paymentNumber: string;
  poNumber: string;
  supplierCode: string;
  supplierName: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bankOrAccount: string;
  amount: number;
  status: PurchasePaymentStatus;
  notes?: string;
}

export interface PurchasePaymentFormData {
  paymentNumber: string;
  poNumber: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bankOrAccount: string;
  amount: number;
  status: PurchasePaymentStatus;
  notes: string;
}

@Component({
  selector: 'app-purchase-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './purchase-payment.component.html',
  styleUrls: ['./purchase-payment.component.scss']
})
export class PurchasePaymentComponent {

  // ── Catalogs ──────────────────────────────────────────────────────────────
  readonly paymentMethods: PaymentMethod[] = [
    'Bank Transfer',
    'Cheque',
    'Cash',
    'Corporate Card',
    'Letter of Credit'
  ];

  readonly statusFilters: string[] = [
    'All',
    'Completed',
    'Pending Clearing',
    'Voided'
  ];

  readonly purchaseOrdersCatalog: PurchaseOrderRef[] = [
    { poNumber: 'PO-2026-001', supplierCode: 'SUP-001', supplierName: 'Shea Naturals Ltd.',          paymentTerms: 'Net 30',           orderDate: '2026-02-10', totalAmount: 2292.50 },
    { poNumber: 'PO-2026-002', supplierCode: 'SUP-002', supplierName: 'Atlas Botanicals Co.',        paymentTerms: 'Net 45',           orderDate: '2026-02-14', totalAmount: 3600.00 },
    { poNumber: 'PO-2026-003', supplierCode: 'SUP-003', supplierName: 'ChemPure Ingredients GmbH',   paymentTerms: 'Net 60',           orderDate: '2026-02-20', totalAmount: 1940.00 },
    { poNumber: 'PO-2026-004', supplierCode: 'SUP-004', supplierName: 'GlassCraft Packaging',        paymentTerms: 'Net 30',           orderDate: '2026-02-25', totalAmount: 1750.00 },
    { poNumber: 'PO-2026-005', supplierCode: 'SUP-005', supplierName: 'Maison Arôme SAS',            paymentTerms: 'Net 45',           orderDate: '2026-03-01', totalAmount: 2100.00 },
    { poNumber: 'PO-2026-006', supplierCode: 'SUP-007', supplierName: 'BioActive Labs Inc.',         paymentTerms: 'Advance Payment',  orderDate: '2026-03-04', totalAmount: 3125.00 },
    { poNumber: 'PO-2026-007', supplierCode: 'SUP-010', supplierName: 'Jeju Green Extracts',         paymentTerms: 'Net 30',           orderDate: '2026-03-08', totalAmount: 2480.00 },
    { poNumber: 'PO-2026-008', supplierCode: 'SUP-006', supplierName: 'Pacific Surfactants',         paymentTerms: 'Net 15',           orderDate: '2026-03-11', totalAmount: 1620.00 }
  ];

  // ── Filter & Pagination State ─────────────────────────────────────────────
  searchQuery   = signal('');
  methodFilter  = signal('All');
  statusFilter  = signal('All');
  currentPage   = signal(1);
  pageSize      = signal(5);

  // ── Initial Mock Dataset (10 Purchase Payments) ───────────────────────────
  payments = signal<PurchasePayment[]>([
    {
      id: 1,
      paymentNumber: 'PAY-2026-001',
      poNumber: 'PO-2026-001',
      supplierCode: 'SUP-001',
      supplierName: 'Shea Naturals Ltd.',
      paymentDate: '2026-02-12',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'WT-8849201',
      bankOrAccount: 'HSBC Corporate USD',
      amount: 1000.00,
      status: 'Completed',
      notes: 'Initial partial payment upon first shipment dispatch'
    },
    {
      id: 2,
      paymentNumber: 'PAY-2026-002',
      poNumber: 'PO-2026-001',
      supplierCode: 'SUP-001',
      supplierName: 'Shea Naturals Ltd.',
      paymentDate: '2026-02-25',
      paymentMethod: 'Cheque',
      referenceNumber: 'CHQ-409112',
      bankOrAccount: 'Standard Chartered Business',
      amount: 750.00,
      status: 'Pending Clearing',
      notes: 'Second installment post second partial GRN'
    },
    {
      id: 3,
      paymentNumber: 'PAY-2026-003',
      poNumber: 'PO-2026-002',
      supplierCode: 'SUP-002',
      supplierName: 'Atlas Botanicals Co.',
      paymentDate: '2026-02-26',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'SWIFT-294810',
      bankOrAccount: 'HSBC Corporate USD',
      amount: 3600.00,
      status: 'Completed',
      notes: 'Full invoice settlement following complete delivery'
    },
    {
      id: 4,
      paymentNumber: 'PAY-2026-004',
      poNumber: 'PO-2026-003',
      supplierCode: 'SUP-003',
      supplierName: 'ChemPure Ingredients GmbH',
      paymentDate: '2026-02-22',
      paymentMethod: 'Letter of Credit',
      referenceNumber: 'LC-DE-77319',
      bankOrAccount: 'Deutsche Trade Finance',
      amount: 970.00,
      status: 'Completed',
      notes: '50% advance against shipping documents'
    },
    {
      id: 5,
      paymentNumber: 'PAY-2026-005',
      poNumber: 'PO-2026-004',
      supplierCode: 'SUP-004',
      supplierName: 'GlassCraft Packaging',
      paymentDate: '2026-03-06',
      paymentMethod: 'Cheque',
      referenceNumber: 'CHQ-409145',
      bankOrAccount: 'Standard Chartered Business',
      amount: 1750.00,
      status: 'Completed',
      notes: 'Full payment for 5,000 amber dropper bottles'
    },
    {
      id: 6,
      paymentNumber: 'PAY-2026-006',
      poNumber: 'PO-2026-005',
      supplierCode: 'SUP-005',
      supplierName: 'Maison Arôme SAS',
      paymentDate: '2026-03-03',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'SEPA-552019',
      bankOrAccount: 'HSBC Corporate EUR/USD',
      amount: 840.00,
      status: 'Completed',
      notes: '40% deposit for cold-chain rose oil shipment'
    },
    {
      id: 7,
      paymentNumber: 'PAY-2026-007',
      poNumber: 'PO-2026-006',
      supplierCode: 'SUP-007',
      supplierName: 'BioActive Labs Inc.',
      paymentDate: '2026-03-05',
      paymentMethod: 'Corporate Card',
      referenceNumber: 'AUTH-991042',
      bankOrAccount: 'Amex Corporate Platinum',
      amount: 1500.00,
      status: 'Completed',
      notes: 'Advance deposit for Hyaluronic Acid batch'
    },
    {
      id: 8,
      paymentNumber: 'PAY-2026-008',
      poNumber: 'PO-2026-006',
      supplierCode: 'SUP-007',
      supplierName: 'BioActive Labs Inc.',
      paymentDate: '2026-03-12',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'ACH-663812',
      bankOrAccount: 'Citibank Commercial',
      amount: 1625.00,
      status: 'Pending Clearing',
      notes: 'Remaining 52% balance prior to air freight release'
    },
    {
      id: 9,
      paymentNumber: 'PAY-2026-009',
      poNumber: 'PO-2026-008',
      supplierCode: 'SUP-006',
      supplierName: 'Pacific Surfactants',
      paymentDate: '2026-03-14',
      paymentMethod: 'Cash',
      referenceNumber: 'VCH-2026-088',
      bankOrAccount: 'Main Treasury Cash',
      amount: 620.00,
      status: 'Completed',
      notes: 'Partial cash settlement on delivery'
    },
    {
      id: 10,
      paymentNumber: 'PAY-2026-010',
      poNumber: 'PO-2026-003',
      supplierCode: 'SUP-003',
      supplierName: 'ChemPure Ingredients GmbH',
      paymentDate: '2026-02-28',
      paymentMethod: 'Cheque',
      referenceNumber: 'CHQ-409098',
      bankOrAccount: 'Standard Chartered Business',
      amount: 500.00,
      status: 'Voided',
      notes: 'Voided and reissued via Letter of Credit'
    }
  ]);

  // ── Record / Edit Payment Modal State ─────────────────────────────────────
  showModal       = signal(false);
  isEditMode      = signal(false);
  selectedPayment = signal<PurchasePayment | null>(null);
  formData: PurchasePaymentFormData = this.emptyForm();

  // ── View Payment & PO Ledger Modal State ──────────────────────────────────
  showViewModal      = signal(false);
  viewingPayment     = signal<PurchasePayment | null>(null);
  ledgerPage         = signal(1);
  ledgerPageSize     = signal(1);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredPayments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const method = this.methodFilter();
    const status = this.statusFilter();

    return this.payments().filter(p => {
      const matchSearch = !q ||
        p.paymentNumber.toLowerCase().includes(q) ||
        p.poNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.supplierCode.toLowerCase().includes(q) ||
        p.referenceNumber.toLowerCase().includes(q) ||
        p.bankOrAccount.toLowerCase().includes(q);

      const matchMethod = method === 'All' || p.paymentMethod === method;
      const matchStatus = status === 'All' || p.status === status;

      return matchSearch && matchMethod && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPayments().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedPayments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPayments().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredPayments().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredPayments().length)
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  private round2(v: number): number {
    return Math.round(v * 100) / 100;
  }

  private todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  private nextPaymentNumber(): string {
    const list = this.payments?.() ?? [];
    const maxNum = list.reduce((max, p) => {
      const parts = p.paymentNumber.split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return `PAY-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }

  getPoRef(poNumber: string): PurchaseOrderRef | undefined {
    return this.purchaseOrdersCatalog.find(po => po.poNumber === poNumber);
  }

  /** Total non-voided payments recorded for a PO (optionally excluding a specific payment ID when editing). */
  poPaidTotal(poNumber: string, excludePaymentId?: number): number {
    const list = this.payments?.() ?? [];
    return this.round2(
      list
        .filter(p => p.poNumber === poNumber && p.status !== 'Voided' && p.id !== excludePaymentId)
        .reduce((sum, p) => sum + p.amount, 0)
    );
  }

  /** Remaining unpaid balance on a PO (optionally excluding the payment currently being edited). */
  poRemainingBalance(poNumber: string, excludePaymentId?: number): number {
    const po = this.getPoRef(poNumber);
    if (!po) return 0;
    return Math.max(0, this.round2(po.totalAmount - this.poPaidTotal(poNumber, excludePaymentId)));
  }

  /** PO payment status derived from total paid vs PO total. */
  poPaymentStatus(poNumber: string): 'Paid' | 'Partially Paid' | 'Unpaid' {
    const po = this.getPoRef(poNumber);
    if (!po) return 'Unpaid';
    const paid = this.poPaidTotal(poNumber);
    if (paid <= 0) return 'Unpaid';
    if (paid >= po.totalAmount) return 'Paid';
    return 'Partially Paid';
  }

  formEditingExcludeId(): number | undefined {
    return this.isEditMode() ? this.selectedPayment()?.id : undefined;
  }

  formSelectedPo(): PurchaseOrderRef | undefined {
    return this.getPoRef(this.formData.poNumber);
  }

  formMaxPayable(): number {
    return this.poRemainingBalance(this.formData.poNumber, this.formEditingExcludeId());
  }

  private emptyForm(): PurchasePaymentFormData {
    const firstPo = this.purchaseOrdersCatalog[0];
    const remaining = this.poRemainingBalance(firstPo.poNumber);
    return {
      paymentNumber: this.nextPaymentNumber(),
      poNumber: firstPo.poNumber,
      paymentDate: this.todayIso(),
      paymentMethod: 'Bank Transfer',
      referenceNumber: '',
      bankOrAccount: 'HSBC Corporate USD',
      amount: remaining > 0 ? remaining : 100,
      status: 'Completed',
      notes: ''
    };
  }

  methodIcon(method: PaymentMethod): string {
    switch (method) {
      case 'Bank Transfer':    return 'bi-bank';
      case 'Cheque':           return 'bi-journal-check';
      case 'Cash':             return 'bi-cash-stack';
      case 'Corporate Card':   return 'bi-credit-card-2-front';
      case 'Letter of Credit': return 'bi-file-earmark-lock2';
    }
  }

  referenceLabel(method: PaymentMethod): string {
    switch (method) {
      case 'Bank Transfer':    return 'Wire / Transfer Ref. No.';
      case 'Cheque':           return 'Cheque Number';
      case 'Cash':             return 'Cash Voucher No.';
      case 'Corporate Card':   return 'Authorization / Txn ID';
      case 'Letter of Credit': return 'L/C Reference Number';
    }
  }

  referencePlaceholder(method: PaymentMethod): string {
    switch (method) {
      case 'Bank Transfer':    return 'e.g. WT-8849201 or SWIFT ref';
      case 'Cheque':           return 'e.g. CHQ-409150';
      case 'Cash':             return 'e.g. VCH-2026-095';
      case 'Corporate Card':   return 'e.g. AUTH-991205';
      case 'Letter of Credit': return 'e.g. LC-DE-77350';
    }
  }

  statusBadgeClass(status: PurchasePaymentStatus): string {
    switch (status) {
      case 'Completed':        return 'pay-status-completed';
      case 'Pending Clearing': return 'pay-status-pending';
      case 'Voided':           return 'pay-status-voided';
    }
  }

  canClear(payment: PurchasePayment): boolean {
    return payment.status === 'Pending Clearing';
  }

  canEdit(payment: PurchasePayment): boolean {
    return payment.status !== 'Voided';
  }

  canDelete(payment: PurchasePayment): boolean {
    return payment.status === 'Pending Clearing' || payment.status === 'Voided';
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

  setMethodFilter(method: string): void {
    this.methodFilter.set(method);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── Record / Edit Payment Modal Actions ───────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedPayment.set(null);
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(payment: PurchasePayment): void {
    this.isEditMode.set(true);
    this.selectedPayment.set(payment);
    this.formData = {
      paymentNumber: payment.paymentNumber,
      poNumber: payment.poNumber,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      bankOrAccount: payment.bankOrAccount,
      amount: payment.amount,
      status: payment.status,
      notes: payment.notes ?? ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    const p = this.selectedPayment();
    if (this.isEditMode() && p) {
      this.openEditModal(p);
    } else {
      this.formData = this.emptyForm();
    }
  }

  onPoChange(poNumber: string): void {
    const remaining = this.poRemainingBalance(poNumber, this.formEditingExcludeId());
    this.formData.amount = remaining;
  }

  fillFullBalance(): void {
    this.formData.amount = this.formMaxPayable();
  }

  adjustAmount(delta: number, event?: Event): void {
    const max = this.formMaxPayable();
    const next = this.round2((Number(this.formData.amount) || 0) + delta);
    this.formData.amount = max > 0 ? Math.min(max, Math.max(0, next)) : Math.max(0, next);
    this.focusGroupInput(event);
  }

  savePayment(): void {
    const paymentNumber = this.formData.paymentNumber.trim().toUpperCase();
    const po = this.getPoRef(this.formData.poNumber);
    const refNo = this.formData.referenceNumber.trim();
    const bank = this.formData.bankOrAccount.trim();
    const amount = this.round2(Number(this.formData.amount) || 0);

    if (!paymentNumber) {
      alert('Payment number is required.');
      return;
    }

    if (!po) {
      alert('Please select a purchase order.');
      return;
    }

    if (!refNo) {
      alert(`${this.referenceLabel(this.formData.paymentMethod)} is required.`);
      return;
    }

    if (amount <= 0) {
      alert('Payment amount must be greater than 0.');
      return;
    }

    const maxPayable = this.formMaxPayable();
    if (this.formData.status !== 'Voided' && amount > maxPayable + 0.001) {
      alert(`Payment amount ($${amount.toFixed(2)}) exceeds the remaining PO balance ($${maxPayable.toFixed(2)}).`);
      return;
    }

    const editingId = this.formEditingExcludeId();
    if (this.payments().some(p => p.id !== editingId && p.paymentNumber.toUpperCase() === paymentNumber)) {
      alert(`A payment record with number "${paymentNumber}" already exists.`);
      return;
    }

    if (editingId !== undefined) {
      this.payments.update(list =>
        list.map(p =>
          p.id === editingId
            ? {
                ...p,
                paymentNumber,
                poNumber: po.poNumber,
                supplierCode: po.supplierCode,
                supplierName: po.supplierName,
                paymentDate: this.formData.paymentDate,
                paymentMethod: this.formData.paymentMethod,
                referenceNumber: refNo,
                bankOrAccount: bank || 'General Treasury',
                amount,
                status: this.formData.status,
                notes: this.formData.notes.trim() || undefined
              }
            : p
        )
      );
    } else {
      const newId = Math.max(0, ...this.payments().map(p => p.id)) + 1;
      const newPayment: PurchasePayment = {
        id: newId,
        paymentNumber,
        poNumber: po.poNumber,
        supplierCode: po.supplierCode,
        supplierName: po.supplierName,
        paymentDate: this.formData.paymentDate,
        paymentMethod: this.formData.paymentMethod,
        referenceNumber: refNo,
        bankOrAccount: bank || 'General Treasury',
        amount,
        status: this.formData.status,
        notes: this.formData.notes.trim() || undefined
      };
      this.payments.update(list => [newPayment, ...list]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  markAsCleared(payment: PurchasePayment): void {
    if (!this.canClear(payment)) return;
    this.payments.update(list =>
      list.map(p => (p.id === payment.id ? { ...p, status: 'Completed' } : p))
    );
    if (this.viewingPayment()?.id === payment.id) {
      this.viewingPayment.set({ ...payment, status: 'Completed' });
    }
  }

  deletePayment(payment: PurchasePayment): void {
    const confirmed = confirm(
      `Are you sure you want to delete payment "${payment.paymentNumber}" (${payment.poNumber} · ${payment.supplierName})?`
    );
    if (!confirmed) return;

    this.payments.update(list => list.filter(p => p.id !== payment.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  // ── View Payment & PO Ledger Modal Actions ────────────────────────────────
  openViewModal(payment: PurchasePayment): void {
    this.viewingPayment.set(payment);
    this.ledgerPage.set(1);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
  }

  poPaymentHistory(): PurchasePayment[] {
    const vp = this.viewingPayment();
    if (!vp) return [];
    return this.payments().filter(p => p.poNumber === vp.poNumber);
  }

  ledgerTotalPages(): number {
    return Math.max(1, Math.ceil(this.poPaymentHistory().length / this.ledgerPageSize()));
  }

  ledgerPageNumbers(): number[] {
    return Array.from({ length: this.ledgerTotalPages() }, (_, i) => i + 1);
  }

  pagedPoPaymentHistory(): PurchasePayment[] {
    const list = this.poPaymentHistory();
    const size = this.ledgerPageSize();
    const start = (this.ledgerPage() - 1) * size;
    return list.slice(start, start + size);
  }

  ledgerShowingFrom(): number {
    const len = this.poPaymentHistory().length;
    return len === 0 ? 0 : (this.ledgerPage() - 1) * this.ledgerPageSize() + 1;
  }

  ledgerShowingTo(): number {
    const len = this.poPaymentHistory().length;
    return Math.min(this.ledgerPage() * this.ledgerPageSize(), len);
  }

  goToLedgerPage(page: number): void {
    if (page >= 1 && page <= this.ledgerTotalPages()) {
      this.ledgerPage.set(page);
    }
  }
}

