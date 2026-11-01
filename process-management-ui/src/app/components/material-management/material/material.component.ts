import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export type MovementType = 'Opening' | 'Receipt' | 'Issue' | 'Adjustment In' | 'Adjustment Out';

export interface Material {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  /** Read-only — derived from the stock movement ledger. */
  currentStock: number;
  minStock: number;
  /** Read-only — weighted average cost, recalculated on goods receipt. */
  avgCost: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface StockMovement {
  id: number;
  materialId: number;
  /** Local ISO date-time (YYYY-MM-DDTHH:mm:ss). */
  date: string;
  type: MovementType;
  /** Signed quantity: positive = stock in, negative = stock out. */
  quantity: number;
  unitCost: number;
  balanceAfter: number;
  reference: string;
  /** Expiry date (YYYY-MM-DD) of the lot received — inbound movements only. */
  expiryDate?: string;
  reason?: string;
  remarks?: string;
  user: string;
}

export interface MaterialFormData {
  name: string;
  code: string;
  category: string;
  unit: string;
  openingStock: number | null;
  openingCost: number | null;
  openingExpiry: string;
  minStock: number | null;
  status: 'Active' | 'Inactive';
}

export interface AdjustmentFormData {
  direction: 'In' | 'Out';
  quantity: number | null;
  expiryDate: string;
  reason: string;
  remarks: string;
}

export type ExpiryStatus = 'expired' | 'soon' | 'ok';

type SeedActivity = Pick<StockMovement, 'materialId' | 'date' | 'type' | 'quantity' | 'reference'> &
  Partial<Pick<StockMovement, 'unitCost' | 'expiryDate' | 'reason' | 'remarks'>>;

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss']
})
export class MaterialComponent {

  private readonly currentUser = 'John Doe';
  private adjustmentSeq = 4;

  /** Lots expiring within this many days are flagged as "Expiring Soon". */
  readonly expiryWarningDays = 90;

  // ── Predefined Cosmetics Categories & Units ──────────────────────────────
  readonly categoriesList: string[] = [
    'Oils, Butters & Waxes',
    'Surfactants & Foaming Agents',
    'Active Ingredients & Peptides',
    'Emulsifiers & Solubilizers',
    'Fragrances & Essential Oils',
    'Colorants, Dyes & Mica',
    'Botanical & Herbal Extracts',
    'Humectants & Hydrators',
    'Preservatives & Antioxidants',
    'Thickeners & Texture Modifiers',
    'Primary Packaging & Containers',
    'Secondary Packaging & Labels'
  ];

  readonly unitsList: string[] = [
    'Kilogram (kg)',
    'Gram (g)',
    'Liter (L)',
    'Milliliter (ml)',
    'Piece (pcs)',
    'Drum (drm)',
    'Box (bx)'
  ];

  readonly adjustmentReasonsIn: string[] = [
    'Physical Count Correction',
    'Found / Recovered',
    'Production Return',
    'Other'
  ];

  readonly adjustmentReasonsOut: string[] = [
    'Physical Count Correction',
    'Damaged / Spoiled',
    'Expired',
    'Quality Rejection',
    'Sample / Testing',
    'Other'
  ];

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery      = signal('');
  categoryFilter   = signal('All');
  stockFilter      = signal('All');
  statusFilter     = signal('All');
  showModal        = signal(false);
  isEditMode       = signal(false);
  selectedMaterial = signal<Material | null>(null);

  // Stock Adjustment Modal State
  showAdjustmentModal = signal(false);
  adjustmentMaterial  = signal<Material | null>(null);
  adjustmentForm: AdjustmentFormData = this.emptyAdjustmentForm();

  // Stock History Modal State
  showHistoryModal = signal(false);
  historyMaterial  = signal<Material | null>(null);
  historyPage      = signal(1);
  readonly historyPageSize = 5;

  // Form Model
  formData: MaterialFormData = this.emptyMaterialForm();

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Initial Mock Dataset (12 Cosmetics Raw Materials) ─────────────────────
  materials = signal<Material[]>([
    { id: 1,  name: 'Organic Shea Butter (Unrefined)',   code: 'RM-OBW-001', category: 'Oils, Butters & Waxes',           unit: 'Kilogram (kg)', currentStock: 350,  minStock: 80,   avgCost: 14.50,  status: 'Active',   createdAt: '2026-01-10' },
    { id: 2,  name: 'Niacinamide (Pure Powder 99%)',     code: 'RM-ACT-002', category: 'Active Ingredients & Peptides',   unit: 'Kilogram (kg)', currentStock: 45,   minStock: 15,   avgCost: 48.00,  status: 'Active',   createdAt: '2026-01-12' },
    { id: 3,  name: 'Cocamidopropyl Betaine (30%)',      code: 'RM-SRF-003', category: 'Surfactants & Foaming Agents',    unit: 'Liter (L)',     currentStock: 820,  minStock: 200,  avgCost: 3.80,   status: 'Active',   createdAt: '2026-01-15' },
    { id: 4,  name: 'Bulgarian Rose Essential Oil',      code: 'RM-FRG-004', category: 'Fragrances & Essential Oils',     unit: 'Liter (L)',     currentStock: 14,   minStock: 10,   avgCost: 420.00, status: 'Active',   createdAt: '2026-01-18' },
    { id: 5,  name: 'Cetearyl Alcohol (Flakes)',         code: 'RM-EMU-005', category: 'Emulsifiers & Solubilizers',      unit: 'Kilogram (kg)', currentStock: 260,  minStock: 50,   avgCost: 6.20,   status: 'Active',   createdAt: '2026-01-20' },
    { id: 6,  name: 'Hyaluronic Acid (High MW)',         code: 'RM-ACT-006', category: 'Active Ingredients & Peptides',   unit: 'Gram (g)',      currentStock: 450,  minStock: 500,  avgCost: 1.25,   status: 'Active',   createdAt: '2026-02-01' },
    { id: 7,  name: 'Cosmetic Iron Oxide (Red 101)',     code: 'RM-COL-007', category: 'Colorants, Dyes & Mica',          unit: 'Kilogram (kg)', currentStock: 75,   minStock: 20,   avgCost: 22.00,  status: 'Active',   createdAt: '2026-02-05' },
    { id: 8,  name: 'Centella Asiatica Extract (10:1)',  code: 'RM-BOT-008', category: 'Botanical & Herbal Extracts',     unit: 'Liter (L)',     currentStock: 65,   minStock: 25,   avgCost: 62.00,  status: 'Active',   createdAt: '2026-02-10' },
    { id: 9,  name: 'Vegetable Glycerin (USP Grade)',    code: 'RM-HUM-009', category: 'Humectants & Hydrators',          unit: 'Liter (L)',     currentStock: 1200, minStock: 300,  avgCost: 2.40,   status: 'Active',   createdAt: '2026-02-15' },
    { id: 10, name: 'Phenoxyethanol (Preservative)',     code: 'RM-PRS-010', category: 'Preservatives & Antioxidants',    unit: 'Liter (L)',     currentStock: 90,   minStock: 30,   avgCost: 18.50,  status: 'Active',   createdAt: '2026-02-20' },
    { id: 11, name: 'Xanthan Gum (Clear 200 Mesh)',      code: 'RM-THK-011', category: 'Thickeners & Texture Modifiers',  unit: 'Kilogram (kg)', currentStock: 12,   minStock: 50,   avgCost: 16.00,  status: 'Inactive', createdAt: '2026-02-25' },
    { id: 12, name: 'Amber Glass Dropper Bottle (30ml)', code: 'PM-PKG-012', category: 'Primary Packaging & Containers', unit: 'Piece (pcs)',   currentStock: 4500, minStock: 1000, avgCost: 0.35,   status: 'Inactive', createdAt: '2026-03-01' }
  ]);

  // Expiry dates of the opening-balance lots (packaging items have no expiry)
  private readonly seedOpeningExpiry: Record<number, string> = {
    1: '2026-09-30', 2: '2027-01-15', 3: '2027-06-30', 4: '2028-01-31',
    5: '2027-08-31', 6: '2026-12-10', 7: '2029-02-28', 8: '2027-02-10',
    9: '2027-03-15', 10: '2028-02-20', 11: '2026-10-15'
  };

  // Sample stock activity after the opening balance (receipts, issues, adjustments)
  private readonly seedActivity: SeedActivity[] = [
    { materialId: 1,  date: '2026-01-22T11:15:00', type: 'Issue',          quantity: -40,  reference: 'BATCH-1008', remarks: 'Issued to production' },
    { materialId: 1,  date: '2026-02-14T10:20:00', type: 'Receipt',        quantity: 200,  unitCost: 14.20, expiryDate: '2027-08-31', reference: 'GRN-0003', remarks: 'PO-0002 · Shea Naturals Ltd.' },
    { materialId: 1,  date: '2026-03-05T15:45:00', type: 'Issue',          quantity: -120, reference: 'BATCH-1021', remarks: 'Issued to production' },
    { materialId: 1,  date: '2026-03-20T09:10:00', type: 'Adjustment Out', quantity: -5,   reference: 'ADJ-0001', reason: 'Damaged / Spoiled', remarks: 'Container seal broken' },
    { materialId: 1,  date: '2026-04-02T14:00:00', type: 'Receipt',        quantity: 150,  unitCost: 14.60, expiryDate: '2027-11-30', reference: 'GRN-0008', remarks: 'PO-0007 · Shea Naturals Ltd.' },
    { materialId: 1,  date: '2026-04-18T10:30:00', type: 'Issue',          quantity: -60,  reference: 'BATCH-1035', remarks: 'Issued to production' },
    { materialId: 2,  date: '2026-02-18T11:00:00', type: 'Receipt',        quantity: 25,   unitCost: 49.00, expiryDate: '2027-09-30', reference: 'GRN-0004', remarks: 'PO-0003 · ChemActive Supplies' },
    { materialId: 2,  date: '2026-03-12T14:30:00', type: 'Issue',          quantity: -20,  reference: 'BATCH-1024', remarks: 'Issued to production' },
    { materialId: 4,  date: '2026-03-01T10:00:00', type: 'Adjustment Out', quantity: -1,   reference: 'ADJ-0002', reason: 'Physical Count Correction', remarks: 'Cycle count variance' },
    { materialId: 6,  date: '2026-03-08T13:15:00', type: 'Issue',          quantity: -300, reference: 'BATCH-1027', remarks: 'Issued to production' },
    { materialId: 9,  date: '2026-03-10T08:40:00', type: 'Receipt',        quantity: 600,  unitCost: 2.35,  expiryDate: '2028-03-10', reference: 'GRN-0006', remarks: 'PO-0005 · Pure Glycerin Co.' },
    { materialId: 11, date: '2026-03-15T16:00:00', type: 'Adjustment Out', quantity: -8,   reference: 'ADJ-0003', reason: 'Expired' }
  ];

  movements = signal<StockMovement[]>(this.buildSeedMovements());

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredMaterials = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const status = this.statusFilter();
    const stock = this.stockFilter();

    return this.materials().filter(m => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);

      const matchCat = cat === 'All' || m.category === cat;
      const matchStatus = status === 'All' || m.status === status;

      let matchStock = true;
      if (stock === 'In Stock') {
        matchStock = m.currentStock > m.minStock;
      } else if (stock === 'Low Stock') {
        matchStock = m.currentStock > 0 && m.currentStock <= m.minStock;
      } else if (stock === 'Out of Stock') {
        matchStock = m.currentStock <= 0;
      }

      return matchSearch && matchCat && matchStatus && matchStock;
    });
  });

  totalPages = computed(() => {
    const count = this.filteredMaterials().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedMaterials = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMaterials().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() => {
    return this.filteredMaterials().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredMaterials().length);
  });

  /** Live material record for the history modal (reflects new movements). */
  historyLiveMaterial = computed(() => {
    const h = this.historyMaterial();
    return h ? this.materials().find(m => m.id === h.id) ?? h : null;
  });

  /** Movements for the material in the history modal, newest first. */
  historyMovements = computed(() => {
    const m = this.historyMaterial();
    if (!m) return [];
    return this.movements()
      .filter(x => x.materialId === m.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });

  historyTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.historyMovements().length / this.historyPageSize))
  );

  historyPageNumbers = computed(() =>
    Array.from({ length: this.historyTotalPages() }, (_, i) => i + 1)
  );

  pagedHistoryMovements = computed(() => {
    const start = (this.historyPage() - 1) * this.historyPageSize;
    return this.historyMovements().slice(start, start + this.historyPageSize);
  });

  historyShowingFrom = computed(() =>
    this.historyMovements().length === 0 ? 0 : (this.historyPage() - 1) * this.historyPageSize + 1
  );

  historyShowingTo = computed(() =>
    Math.min(this.historyPage() * this.historyPageSize, this.historyMovements().length)
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStockStatus(m: Material): { label: string; badgeClass: string } {
    if (m.currentStock <= 0) {
      return { label: 'Out of Stock', badgeClass: 'stock-badge-out' };
    }
    if (m.currentStock <= m.minStock) {
      return { label: 'Low Stock', badgeClass: 'stock-badge-low' };
    }
    return { label: 'In Stock', badgeClass: 'stock-badge-in' };
  }

  unitShort(unit: string): string {
    const match = unit.match(/\(([^)]+)\)/);
    return match ? match[1] : unit;
  }

  movementBadgeClass(type: MovementType): string {
    switch (type) {
      case 'Opening':        return 'mv-opening';
      case 'Receipt':        return 'mv-receipt';
      case 'Issue':          return 'mv-issue';
      case 'Adjustment In':  return 'mv-adj-in';
      case 'Adjustment Out': return 'mv-adj-out';
    }
  }

  get adjustmentReasons(): string[] {
    return this.adjustmentForm.direction === 'In' ? this.adjustmentReasonsIn : this.adjustmentReasonsOut;
  }

  /** Stock balance preview after the pending adjustment. */
  adjustedBalance(): number {
    const m = this.adjustmentMaterial();
    if (!m) return 0;
    const qty = Number(this.adjustmentForm.quantity) || 0;
    const signed = this.adjustmentForm.direction === 'In' ? qty : -qty;
    return this.round2(m.currentStock + signed);
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private toIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Classifies a lot's expiry date relative to today. */
  expiryStatus(expiryDate?: string): ExpiryStatus | null {
    if (!expiryDate) return null;
    const today = new Date();
    const todayIso = this.toIsoDate(today);
    if (expiryDate < todayIso) return 'expired';

    const warnLimit = new Date(today);
    warnLimit.setDate(warnLimit.getDate() + this.expiryWarningDays);
    return expiryDate <= this.toIsoDate(warnLimit) ? 'soon' : 'ok';
  }

  /** Days remaining until expiry (negative when already expired). */
  daysToExpiry(expiryDate: string): number {
    const [y, m, d] = expiryDate.split('-').map(Number);
    const expiry = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
  }

  private nowIso(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  private focusGroupInput(event?: Event): void {
    const btn = event?.currentTarget as HTMLElement | null;
    const input = btn?.closest('.input-group')?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  }

  private emptyMaterialForm(): MaterialFormData {
    return {
      name: '',
      code: '',
      category: this.categoriesList[0],
      unit: this.unitsList[0],
      openingStock: 0,
      openingCost: null,
      openingExpiry: '',
      minStock: 10,
      status: 'Active'
    };
  }

  private emptyAdjustmentForm(): AdjustmentFormData {
    return {
      direction: 'Out',
      quantity: 1,
      expiryDate: '',
      reason: this.adjustmentReasonsOut[0],
      remarks: ''
    };
  }

  /** Builds the ledger so every material's movements sum to its current stock. */
  private buildSeedMovements(): StockMovement[] {
    const result: StockMovement[] = [];
    let id = 1;

    for (const m of this.materials()) {
      const activity = this.seedActivity
        .filter(a => a.materialId === m.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      const activityTotal = activity.reduce((sum, a) => sum + a.quantity, 0);
      let balance = this.round2(m.currentStock - activityTotal);

      result.push({
        id: id++,
        materialId: m.id,
        date: `${m.createdAt ?? '2026-01-01'}T09:00:00`,
        type: 'Opening',
        quantity: balance,
        unitCost: m.avgCost,
        balanceAfter: balance,
        reference: 'OPENING',
        expiryDate: this.seedOpeningExpiry[m.id],
        remarks: 'Opening balance',
        user: this.currentUser
      });

      for (const a of activity) {
        balance = this.round2(balance + a.quantity);
        result.push({
          id: id++,
          materialId: m.id,
          date: a.date,
          type: a.type,
          quantity: a.quantity,
          unitCost: a.unitCost ?? m.avgCost,
          balanceAfter: balance,
          reference: a.reference,
          expiryDate: a.expiryDate,
          reason: a.reason,
          remarks: a.remarks,
          user: this.currentUser
        });
      }
    }

    return result;
  }

  /** Appends a movement to the ledger and updates the material's stock balance. */
  private recordMovement(
    materialId: number,
    type: MovementType,
    quantity: number,
    unitCost: number,
    reference: string,
    reason?: string,
    remarks?: string,
    expiryDate?: string
  ): void {
    const material = this.materials().find(x => x.id === materialId);
    if (!material) return;

    const balanceAfter = this.round2(material.currentStock + quantity);
    const id = Math.max(0, ...this.movements().map(x => x.id)) + 1;

    this.movements.update(list => [
      ...list,
      {
        id,
        materialId,
        date: this.nowIso(),
        type,
        quantity,
        unitCost,
        balanceAfter,
        reference,
        expiryDate: quantity > 0 && expiryDate ? expiryDate : undefined,
        reason,
        remarks,
        user: this.currentUser
      }
    ]);

    this.materials.update(list =>
      list.map(x => (x.id === materialId ? { ...x, currentStock: balanceAfter } : x))
    );
  }

  // ── Pagination Actions ────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setCategoryFilter(cat: string): void {
    this.categoryFilter.set(cat);
    this.currentPage.set(1);
  }

  setStockFilter(stock: string): void {
    this.stockFilter.set(stock);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── CRUD Actions ──────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedMaterial.set(null);
    this.formData = this.emptyMaterialForm();
    this.showModal.set(true);
  }

  openEditModal(m: Material): void {
    this.isEditMode.set(true);
    this.selectedMaterial.set(m);
    this.formData = {
      name: m.name,
      code: m.code,
      category: m.category,
      unit: m.unit,
      openingStock: null,
      openingCost: null,
      openingExpiry: '',
      minStock: m.minStock,
      status: m.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    const m = this.selectedMaterial();
    if (this.isEditMode() && m) {
      this.openEditModal(m);
    } else {
      this.formData = this.emptyMaterialForm();
    }
  }

  saveMaterial(): void {
    const name = this.formData.name.trim();
    const code = this.formData.code.trim().toUpperCase();
    const category = this.formData.category;
    const unit = this.formData.unit;
    const minStock = Number(this.formData.minStock) || 0;

    if (!name) {
      alert('Material name is required.');
      return;
    }

    if (!code) {
      alert('Material code / SKU is required.');
      return;
    }

    // Check duplicate code
    const duplicate = this.materials().some(m =>
      (!this.isEditMode() || m.id !== this.selectedMaterial()!.id) &&
      m.code.toUpperCase() === code
    );

    if (duplicate) {
      alert(`A material with the code/SKU "${code}" already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedMaterial()) {
      // Stock and average cost are read-only here — they change only via the ledger.
      this.materials.update(list =>
        list.map(m =>
          m.id === this.selectedMaterial()!.id
            ? { ...m, name, code, category, unit, minStock, status: this.formData.status }
            : m
        )
      );
    } else {
      const openingStock = Math.max(0, this.round2(Number(this.formData.openingStock) || 0));
      const openingCost = Math.max(0, this.round2(Number(this.formData.openingCost) || 0));
      const newId = Math.max(0, ...this.materials().map(m => m.id)) + 1;

      const newMaterial: Material = {
        id: newId,
        name,
        code,
        category,
        unit,
        currentStock: 0,
        minStock,
        avgCost: openingCost,
        status: this.formData.status,
        createdAt: this.nowIso().split('T')[0]
      };
      this.materials.update(list => [newMaterial, ...list]);
      this.recordMovement(newId, 'Opening', openingStock, openingCost, 'OPENING', undefined, 'Opening balance', this.formData.openingExpiry || undefined);
    }

    this.closeModal();
  }

  deleteMaterial(m: Material): void {
    if (m.currentStock > 0) {
      const confirmed = confirm(
        `Material "${m.name} (${m.code})" currently has ${m.currentStock} ${m.unit} in stock.\nDeleting this material will erase active inventory records. Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Are you sure you want to delete material "${m.name} (${m.code})"?`);
      if (!confirmed) return;
    }

    this.materials.update(list => list.filter(item => item.id !== m.id));
    this.movements.update(list => list.filter(item => item.materialId !== m.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(m: Material): void {
    this.materials.update(list =>
      list.map(item =>
        item.id === m.id
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      )
    );
  }

  adjustNumber(field: 'openingStock' | 'openingCost' | 'minStock', delta: number, event?: Event): void {
    const current = Number(this.formData[field]) || 0;
    this.formData[field] = Math.max(0, this.round2(current + delta));
    this.focusGroupInput(event);
  }

  // ── Stock Adjustment Modal Actions ────────────────────────────────────────
  openAdjustmentModal(m: Material): void {
    this.adjustmentMaterial.set(m);
    this.adjustmentForm = this.emptyAdjustmentForm();
    this.showAdjustmentModal.set(true);
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal.set(false);
  }

  resetAdjustmentForm(): void {
    this.adjustmentForm = this.emptyAdjustmentForm();
  }

  setAdjustmentDirection(direction: 'In' | 'Out'): void {
    if (this.adjustmentForm.direction === direction) return;
    this.adjustmentForm.direction = direction;
    this.adjustmentForm.reason = this.adjustmentReasons[0];
    this.adjustmentForm.expiryDate = '';
  }

  adjustAdjustmentQty(delta: number, event?: Event): void {
    const current = Number(this.adjustmentForm.quantity) || 0;
    this.adjustmentForm.quantity = Math.max(0, this.round2(current + delta));
    this.focusGroupInput(event);
  }

  saveAdjustment(): void {
    const target = this.adjustmentMaterial();
    if (!target) return;

    const live = this.materials().find(x => x.id === target.id) ?? target;
    const qty = this.round2(Number(this.adjustmentForm.quantity) || 0);
    const { direction, reason } = this.adjustmentForm;
    const remarks = this.adjustmentForm.remarks.trim();

    if (qty <= 0) {
      alert('Please enter an adjustment quantity greater than 0.');
      return;
    }

    if (direction === 'Out' && qty > live.currentStock) {
      alert(`Cannot decrease by ${qty}. Only ${live.currentStock} ${this.unitShort(live.unit)} is in stock.`);
      return;
    }

    if (reason === 'Other' && !remarks) {
      alert('Please enter remarks describing the adjustment reason.');
      return;
    }

    const reference = `ADJ-${String(this.adjustmentSeq++).padStart(4, '0')}`;
    this.recordMovement(
      live.id,
      direction === 'In' ? 'Adjustment In' : 'Adjustment Out',
      direction === 'In' ? qty : -qty,
      live.avgCost,
      reference,
      reason,
      remarks || undefined,
      direction === 'In' ? this.adjustmentForm.expiryDate || undefined : undefined
    );

    this.closeAdjustmentModal();
  }

  // ── Stock History Modal Actions ───────────────────────────────────────────
  openHistoryModal(m: Material): void {
    this.historyMaterial.set(m);
    this.historyPage.set(1);
    this.showHistoryModal.set(true);
  }

  goToHistoryPage(page: number): void {
    if (page >= 1 && page <= this.historyTotalPages()) {
      this.historyPage.set(page);
    }
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
  }

  adjustFromHistory(): void {
    const m = this.historyLiveMaterial();
    if (!m) return;
    this.closeHistoryModal();
    this.openAdjustmentModal(m);
  }
}
