import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export type ExpiryMode = 'years' | 'exact';

export interface ProductBatch {
  id: number;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  status: 'Active' | 'Depleted' | 'Expired';
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  batches: ProductBatch[];
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  isPrivateLabel?: boolean;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  batchNumber: string;
  mfgDate: string;
  expiryMode: ExpiryMode;
  expiryYears: number;
  expiryDate: string;
  sellingPrice: number | null;
  costPrice: number | null;
  currentStock: number | null;
  minStock: number | null;
  isPrivateLabel: boolean;
  status: 'Active' | 'Inactive';
  description: string;
}

export interface BatchFormData {
  batchNumber: string;
  mfgDate: string;
  expiryMode: ExpiryMode;
  expiryYears: number;
  expiryDate: string;
  quantity: number | null;
  costPrice: number | null;
  sellingPrice: number | null;
}

export type ExpiryStatus = 'expired' | 'soon' | 'ok';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  readonly expiryWarningDays = 90;

  // ── Categories & Units Catalogues ──────────────────────────────────────────
  readonly categoriesList: string[] = [
    'Facial Skincare',
    'Body Care',
    'Hair Care',
    'Lip Care',
    'Color Cosmetics',
    'Fragrances',
    'Sun Care',
    "Men's Grooming",
    'Baby & Kids Care',
    'Bath & Spa',
    'Gift Sets & Bundles',
    'Travel & Mini Sizes'
  ];

  readonly packagingUnits: string[] = [
    'Bottle (30ml)',
    'Bottle (50ml)',
    'Bottle (100ml)',
    'Pump Bottle (250ml)',
    'Dropper Bottle (30ml)',
    'Dropper Bottle (50ml)',
    'Jar (50g)',
    'Jar (200ml)',
    'Tub (200ml)',
    'Tube (50ml)',
    'Tube (75ml)',
    'Pot (15g)',
    'Pouch (500g)',
    'Box (set)',
    'Piece (pcs)'
  ];

  // ── Filters & Search ───────────────────────────────────────────────────────
  searchQuery    = signal('');
  categoryFilter = signal('All');
  labelFilter    = signal<'All' | 'General' | 'Private Label'>('All');
  statusFilter   = signal('All');

  // ── Pagination State ───────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Modal State ────────────────────────────────────────────────────────────
  showModal       = signal(false);
  isEditMode      = signal(false);
  selectedProduct = signal<Product | null>(null);

  showViewModal   = signal(false);
  viewingProduct  = signal<Product | null>(null);

  showBatchModal  = signal(false);
  batchProduct    = signal<Product | null>(null);
  batchFormData: BatchFormData = this.emptyBatchForm();

  formData: ProductFormData = this.emptyForm();

  // ── Initial Mock Dataset (15 Finished Cosmetic Products with Batches) ──────
  products = signal<Product[]>([
    {
      id: 1,
      name: 'Rosewater Hydrating Face Mist',
      sku: 'PRD-SKN-001',
      barcode: '8934001001',
      category: 'Facial Skincare',
      unit: 'Bottle (100ml)',
      sellingPrice: 24.00,
      costPrice: 6.20,
      currentStock: 350,
      minStock: 60,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Refreshing organic rose damascena toner with glycerin and aloe vera.',
      createdAt: '2026-01-10',
      batches: [
        { id: 101, batchNumber: 'BAT-2026-001', mfgDate: '2026-01-10', expiryDate: '2027-07-10', quantity: 200, costPrice: 6.20, sellingPrice: 24.00, status: 'Active' },
        { id: 102, batchNumber: 'BAT-2026-014', mfgDate: '2026-02-15', expiryDate: '2027-08-15', quantity: 150, costPrice: 6.50, sellingPrice: 25.00, status: 'Active' }
      ]
    },
    {
      id: 2,
      name: 'Niacinamide 10% + Zinc Serum',
      sku: 'PRD-SKN-002',
      barcode: '8934001002',
      category: 'Facial Skincare',
      unit: 'Dropper Bottle (30ml)',
      sellingPrice: 28.50,
      costPrice: 7.10,
      currentStock: 420,
      minStock: 80,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Blemish and sebum control formula with high-purity Vitamin B3 and zinc PCA.',
      createdAt: '2026-01-12',
      batches: [
        { id: 103, batchNumber: 'BAT-2026-002', mfgDate: '2026-01-12', expiryDate: '2027-06-12', quantity: 420, costPrice: 7.10, sellingPrice: 28.50, status: 'Active' }
      ]
    },
    {
      id: 3,
      name: 'Botanical Ceramide Barrier Cream',
      sku: 'PRD-SKN-003',
      barcode: '8934001003',
      category: 'Facial Skincare',
      unit: 'Jar (50g)',
      sellingPrice: 34.00,
      costPrice: 8.90,
      currentStock: 180,
      minStock: 50,
      status: 'Active',
      description: 'Ultra-repairing lipid moisturizer with 3 essential skin-identical ceramides.',
      createdAt: '2026-01-15',
      batches: [
        { id: 104, batchNumber: 'BAT-2026-003', mfgDate: '2026-01-15', expiryDate: '2027-09-15', quantity: 180, costPrice: 8.90, sellingPrice: 34.00, status: 'Active' }
      ]
    },
    {
      id: 4,
      name: 'Whipped Shea & Cocoa Body Butter',
      sku: 'PRD-BDY-004',
      barcode: '8934002001',
      category: 'Body Care',
      unit: 'Tub (200ml)',
      sellingPrice: 22.00,
      costPrice: 5.40,
      currentStock: 260,
      minStock: 45,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Rich, non-greasy body moisturizer whipped with Ghanaian unrefined shea butter.',
      createdAt: '2026-01-18',
      batches: [
        { id: 105, batchNumber: 'BAT-2026-004', mfgDate: '2026-01-18', expiryDate: '2027-05-18', quantity: 260, costPrice: 5.40, sellingPrice: 22.00, status: 'Active' }
      ]
    },
    {
      id: 5,
      name: 'Exfoliating Himalayan Salt Scrub',
      sku: 'PRD-BDY-005',
      barcode: '8934002002',
      category: 'Body Care',
      unit: 'Jar (200ml)',
      sellingPrice: 19.50,
      costPrice: 4.80,
      currentStock: 140,
      minStock: 40,
      status: 'Active',
      description: 'Mineral-rich detoxifying body polish infused with sweet almond oil and rosemary.',
      createdAt: '2026-01-22',
      batches: [
        { id: 106, batchNumber: 'BAT-2026-005', mfgDate: '2026-01-22', expiryDate: '2026-12-22', quantity: 140, costPrice: 4.80, sellingPrice: 19.50, status: 'Active' }
      ]
    },
    {
      id: 6,
      name: 'Keratin Nourishing Hair Mask',
      sku: 'PRD-HAR-006',
      barcode: '8934003001',
      category: 'Hair Care',
      unit: 'Jar (200ml)',
      sellingPrice: 26.00,
      costPrice: 6.80,
      currentStock: 95,
      minStock: 30,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Intense deep conditioner for damaged cuticles with hydrolyzed vegetable keratin.',
      createdAt: '2026-01-25',
      batches: [
        { id: 107, batchNumber: 'BAT-2026-006', mfgDate: '2026-01-25', expiryDate: '2027-01-25', quantity: 95, costPrice: 6.80, sellingPrice: 26.00, status: 'Active' }
      ]
    },
    {
      id: 7,
      name: 'Argan & Rosemary Scalp Oil',
      sku: 'PRD-HAR-007',
      barcode: '8934003002',
      category: 'Hair Care',
      unit: 'Dropper Bottle (50ml)',
      sellingPrice: 21.00,
      costPrice: 5.20,
      currentStock: 210,
      minStock: 50,
      status: 'Active',
      description: 'Cold-pressed Moroccan argan oil infused with rosemary essential oil for hair density.',
      createdAt: '2026-01-28',
      batches: [
        { id: 108, batchNumber: 'BAT-2026-007', mfgDate: '2026-01-28', expiryDate: '2027-07-28', quantity: 210, costPrice: 5.20, sellingPrice: 21.00, status: 'Active' }
      ]
    },
    {
      id: 8,
      name: 'Tinted Peptide Overnight Lip Mask',
      sku: 'PRD-LIP-008',
      barcode: '8934004001',
      category: 'Lip Care',
      unit: 'Pot (15g)',
      sellingPrice: 14.50,
      costPrice: 3.20,
      currentStock: 25,
      minStock: 40,
      status: 'Active',
      description: 'Berry-scented lip treatment with plumping tripeptides and murumuru butter.',
      createdAt: '2026-02-02',
      batches: [
        { id: 109, batchNumber: 'BAT-2025-088', mfgDate: '2025-05-10', expiryDate: '2026-05-10', quantity: 25, costPrice: 3.20, sellingPrice: 14.50, status: 'Active' }
      ]
    },
    {
      id: 9,
      name: 'Velvet Matte Weightless Foundation',
      sku: 'PRD-MAK-009',
      barcode: '8934005001',
      category: 'Color Cosmetics',
      unit: 'Pump Bottle (30ml)',
      sellingPrice: 38.00,
      costPrice: 9.50,
      currentStock: 175,
      minStock: 50,
      status: 'Active',
      description: 'Breathable medium-to-full buildable coverage with oil-absorbing mineral silica.',
      createdAt: '2026-02-05',
      batches: [
        { id: 110, batchNumber: 'BAT-2026-009', mfgDate: '2026-02-05', expiryDate: '2027-08-05', quantity: 100, costPrice: 9.50, sellingPrice: 38.00, status: 'Active' },
        { id: 111, batchNumber: 'BAT-2026-018', mfgDate: '2026-03-01', expiryDate: '2027-09-01', quantity: 75, costPrice: 10.00, sellingPrice: 39.50, status: 'Active' }
      ]
    },
    {
      id: 10,
      name: 'Eau de Parfum - Jasmine & Oud',
      sku: 'PRD-FRG-010',
      barcode: '8934006001',
      category: 'Fragrances',
      unit: 'Bottle (50ml)',
      sellingPrice: 65.00,
      costPrice: 16.00,
      currentStock: 85,
      minStock: 25,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Artisanal perfume blend featuring sambac jasmine, smoked oud, and amber woods.',
      createdAt: '2026-02-10',
      batches: [
        { id: 112, batchNumber: 'BAT-2026-010', mfgDate: '2026-02-10', expiryDate: '2029-02-10', quantity: 85, costPrice: 16.00, sellingPrice: 65.00, status: 'Active' }
      ]
    },
    {
      id: 11,
      name: 'Invisible Mineral Sunscreen SPF 50',
      sku: 'PRD-SUN-011',
      barcode: '8934007001',
      category: 'Sun Care',
      unit: 'Tube (50ml)',
      sellingPrice: 29.00,
      costPrice: 7.40,
      currentStock: 0,
      minStock: 50,
      status: 'Active',
      description: 'Broad-spectrum non-nano zinc oxide sunscreen with zero white cast.',
      createdAt: '2026-02-14',
      batches: [
        { id: 113, batchNumber: 'BAT-2025-072', mfgDate: '2025-02-14', expiryDate: '2026-02-14', quantity: 0, costPrice: 7.40, sellingPrice: 29.00, status: 'Expired' }
      ]
    },
    {
      id: 12,
      name: 'Sandalwood Beard Grooming Elixir',
      sku: 'PRD-MEN-012',
      barcode: '8934008001',
      category: "Men's Grooming",
      unit: 'Bottle (30ml)',
      sellingPrice: 18.50,
      costPrice: 4.60,
      currentStock: 110,
      minStock: 30,
      isPrivateLabel: true,
      status: 'Active',
      description: 'Fast-absorbing jojoba and grapeseed beard oil with natural Mysore sandalwood notes.',
      createdAt: '2026-02-18',
      batches: [
        { id: 114, batchNumber: 'BAT-2026-012', mfgDate: '2026-02-18', expiryDate: '2027-08-18', quantity: 110, costPrice: 4.60, sellingPrice: 18.50, status: 'Active' }
      ]
    },
    {
      id: 13,
      name: 'Soothing Organic Calendula Baby Wash',
      sku: 'PRD-BAB-013',
      barcode: '8934009001',
      category: 'Baby & Kids Care',
      unit: 'Pump Bottle (250ml)',
      sellingPrice: 16.00,
      costPrice: 3.90,
      currentStock: 90,
      minStock: 25,
      status: 'Active',
      description: 'Tear-free sulfate-free 2-in-1 cleanser formulated for sensitive infant skin.',
      createdAt: '2026-02-22',
      batches: [
        { id: 115, batchNumber: 'BAT-2026-013', mfgDate: '2026-02-22', expiryDate: '2027-08-22', quantity: 90, costPrice: 3.90, sellingPrice: 16.00, status: 'Active' }
      ]
    },
    {
      id: 14,
      name: 'Aromatherapy Botanical Bath Salts',
      sku: 'PRD-BTH-014',
      barcode: '8934010001',
      category: 'Bath & Spa',
      unit: 'Pouch (500g)',
      sellingPrice: 17.50,
      costPrice: 4.10,
      currentStock: 130,
      minStock: 35,
      status: 'Active',
      description: 'Pure Epsom and Dead Sea bath crystals scented with lavender and eucalyptus oil.',
      createdAt: '2026-02-26',
      batches: [
        { id: 116, batchNumber: 'BAT-2026-015', mfgDate: '2026-02-26', expiryDate: '2028-02-26', quantity: 130, costPrice: 4.10, sellingPrice: 17.50, status: 'Active' }
      ]
    },
    {
      id: 15,
      name: 'Luxury Glow 4-Piece Discovery Gift Set',
      sku: 'PRD-GFT-015',
      barcode: '8934011001',
      category: 'Gift Sets & Bundles',
      unit: 'Box (set)',
      sellingPrice: 58.00,
      costPrice: 18.50,
      currentStock: 45,
      minStock: 20,
      status: 'Inactive',
      description: 'Deluxe presentation box containing cleanser, toner, facial oil, and satin headband.',
      createdAt: '2026-03-01',
      batches: [
        { id: 117, batchNumber: 'BAT-2026-016', mfgDate: '2026-03-01', expiryDate: '2027-03-01', quantity: 45, costPrice: 18.50, sellingPrice: 58.00, status: 'Active' }
      ]
    }
  ]);

  // ── Computed Signals ───────────────────────────────────────────────────────
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const lbl = this.labelFilter();
    const st = this.statusFilter();

    return this.products().filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.batches?.some(b => b.batchNumber.toLowerCase().includes(q));

      const matchCat = cat === 'All' || p.category === cat;
      const matchLabel =
        lbl === 'All' ||
        (lbl === 'Private Label' && !!p.isPrivateLabel) ||
        (lbl === 'General' && !p.isPrivateLabel);
      const matchStatus = st === 'All' || p.status === st;

      return matchSearch && matchCat && matchLabel && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredProducts().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredProducts().length)
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  private round2(v: number): number {
    return Math.round(v * 100) / 100;
  }

  private todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  calculateExpiryFromYears(mfgDateIso: string, years: number): string {
    if (!mfgDateIso || isNaN(years) || years <= 0) return '';
    const parts = mfgDateIso.split('-').map(Number);
    if (parts.length < 3) return '';
    const [y, m, d] = parts;

    const totalMonthsToAdd = Math.round(years * 12);
    const newYear = y + Math.floor((m - 1 + totalMonthsToAdd) / 12);
    const newMonth = ((m - 1 + totalMonthsToAdd) % 12) + 1;
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const newDay = Math.min(d, maxDays);

    const resY = String(newYear).padStart(4, '0');
    const resM = String(newMonth).padStart(2, '0');
    const resD = String(newDay).padStart(2, '0');
    return `${resY}-${resM}-${resD}`;
  }

  getCalculatedYearsText(mfgDateIso?: string, expiryDateIso?: string): string {
    if (!mfgDateIso || !expiryDateIso) return '—';
    const mfg = new Date(mfgDateIso).getTime();
    const exp = new Date(expiryDateIso).getTime();
    if (isNaN(mfg) || isNaN(exp)) return '—';
    const diffDays = Math.round((exp - mfg) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Invalid (on or before MFD)';
    const years = (diffDays / 365.25).toFixed(1);
    return `${years} Years from MFD (${diffDays} days)`;
  }

  private emptyForm(): ProductFormData {
    const mfg = this.todayIso();
    const defaultYears = 2;
    return {
      name: '',
      sku: this.suggestNextSku(),
      barcode: '',
      category: this.categoriesList[0],
      unit: this.packagingUnits[0],
      batchNumber: this.suggestNextBatchNumber(),
      mfgDate: mfg,
      expiryMode: 'years',
      expiryYears: defaultYears,
      expiryDate: this.calculateExpiryFromYears(mfg, defaultYears),
      sellingPrice: 24.00,
      costPrice: 6.00,
      currentStock: 100,
      minStock: 30,
      isPrivateLabel: false,
      status: 'Active',
      description: ''
    };
  }

  private emptyBatchForm(): BatchFormData {
    const mfg = this.todayIso();
    const defaultYears = 2;
    return {
      batchNumber: this.suggestNextBatchNumber(),
      mfgDate: mfg,
      expiryMode: 'years',
      expiryYears: defaultYears,
      expiryDate: this.calculateExpiryFromYears(mfg, defaultYears),
      quantity: 100,
      costPrice: 6.00,
      sellingPrice: 24.00
    };
  }

  private suggestNextSku(): string {
    const list = this.products?.() ?? [];
    const maxNum = list.reduce((max, p) => {
      const parts = p.sku.split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return `PRD-SKN-${String(maxNum + 1).padStart(3, '0')}`;
  }

  suggestNextBatchNumber(): string {
    const list = this.products?.() ?? [];
    let maxNum = 0;
    list.forEach(p => {
      p.batches?.forEach(b => {
        const parts = b.batchNumber.split('-');
        const n = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(n)) maxNum = Math.max(maxNum, n);
      });
    });
    return `BAT-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }

  // ── Batch & Expiry Helpers ─────────────────────────────────────────────────
  primaryBatch(product: Product): ProductBatch | undefined {
    const active = (product.batches || []).filter(b => b.quantity > 0 && b.status !== 'Expired');
    if (active.length === 0) return product.batches?.[0];
    // Earliest expiry first (FIFO)
    return [...active].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
  }

  primaryBatchNumber(product: Product): string {
    const b = this.primaryBatch(product);
    if (!b) return '—';
    const total = (product.batches || []).length;
    return total > 1 ? `${b.batchNumber} (+${total - 1})` : b.batchNumber;
  }

  nearestExpiryDate(product: Product): string | undefined {
    const b = this.primaryBatch(product);
    return b ? b.expiryDate : undefined;
  }

  expiryStatus(dateStr?: string): ExpiryStatus {
    if (!dateStr) return 'ok';
    const exp = new Date(dateStr).getTime();
    const now = Date.now();
    if (exp <= now) return 'expired';
    const daysLeft = (exp - now) / (1000 * 60 * 60 * 24);
    if (daysLeft <= this.expiryWarningDays) return 'soon';
    return 'ok';
  }

  daysToExpiry(dateStr?: string): number {
    if (!dateStr) return 0;
    const exp = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
  }

  priceDisplay(product: Product): string {
    const batches = (product.batches || []).filter(b => b.quantity > 0 && b.status !== 'Expired');
    if (batches.length <= 1) {
      return `$${product.sellingPrice.toFixed(2)}`;
    }
    const prices = batches.map(b => b.sellingPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `$${min.toFixed(2)}`;
    }
    return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
  }

  costDisplay(product: Product): string {
    const batches = (product.batches || []).filter(b => b.quantity > 0 && b.status !== 'Expired');
    if (batches.length <= 1) {
      return `$${product.costPrice.toFixed(2)}`;
    }
    const costs = batches.map(b => b.costPrice);
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    if (min === max) {
      return `$${min.toFixed(2)}`;
    }
    return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
  }

  calculateMargin(selling: number, cost: number): number {
    if (selling <= 0) return 0;
    return this.round2(((selling - cost) / selling) * 100);
  }

  private focusGroupInput(event?: Event): void {
    const btn = event?.currentTarget as HTMLElement | null;
    const input = btn?.closest('.input-group')?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  }

  // ── Pagination & Filter Actions ───────────────────────────────────────────
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

  setLabelFilter(label: 'All' | 'General' | 'Private Label'): void {
    this.labelFilter.set(label);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  toggleStatus(product: Product): void {
    this.products.update(list =>
      list.map(p =>
        p.id === product.id
          ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }
          : p
      )
    );
  }

  // ── Form Numeric Adjustments ───────────────────────────────────────────────
  adjustFormSellingPrice(delta: number, event?: Event): void {
    const cur = Number(this.formData.sellingPrice) || 0;
    this.formData.sellingPrice = Math.max(0, this.round2(cur + delta));
    this.focusGroupInput(event);
  }

  adjustFormCostPrice(delta: number, event?: Event): void {
    const cur = Number(this.formData.costPrice) || 0;
    this.formData.costPrice = Math.max(0, this.round2(cur + delta));
    this.focusGroupInput(event);
  }

  adjustFormStock(delta: number, event?: Event): void {
    const cur = Number(this.formData.currentStock) || 0;
    this.formData.currentStock = Math.max(0, cur + delta);
    this.focusGroupInput(event);
  }

  adjustFormMinStock(delta: number, event?: Event): void {
    const cur = Number(this.formData.minStock) || 0;
    this.formData.minStock = Math.max(0, cur + delta);
    this.focusGroupInput(event);
  }

  adjustBatchQuantity(delta: number, event?: Event): void {
    const cur = Number(this.batchFormData.quantity) || 0;
    this.batchFormData.quantity = Math.max(0, cur + delta);
    this.focusGroupInput(event);
  }

  adjustBatchCost(delta: number, event?: Event): void {
    const cur = Number(this.batchFormData.costPrice) || 0;
    this.batchFormData.costPrice = Math.max(0, this.round2(cur + delta));
    this.focusGroupInput(event);
  }

  adjustBatchSelling(delta: number, event?: Event): void {
    const cur = Number(this.batchFormData.sellingPrice) || 0;
    this.batchFormData.sellingPrice = Math.max(0, this.round2(cur + delta));
    this.focusGroupInput(event);
  }

  // ── Expiry & Shelf Life Handlers (Product Form) ───────────────────────────
  setProductExpiryMode(mode: ExpiryMode): void {
    this.formData.expiryMode = mode;
    if (mode === 'years') {
      if (!this.formData.expiryYears || this.formData.expiryYears <= 0) {
        this.formData.expiryYears = 2;
      }
      this.updateProductExpiryFromYears();
    } else {
      if (!this.formData.expiryDate && this.formData.mfgDate) {
        this.formData.expiryDate = this.calculateExpiryFromYears(this.formData.mfgDate, this.formData.expiryYears || 2);
      }
    }
  }

  onProductMfgDateChange(): void {
    if (this.formData.expiryMode === 'years') {
      this.updateProductExpiryFromYears();
    } else {
      this.onProductExactExpiryChange();
    }
  }

  onProductExpiryYearsChange(): void {
    this.updateProductExpiryFromYears();
  }

  setProductQuickExpiryYears(years: number): void {
    this.formData.expiryYears = years;
    this.updateProductExpiryFromYears();
  }

  adjustProductExpiryYears(delta: number, event?: Event): void {
    const cur = Number(this.formData.expiryYears) || 0;
    const next = Math.max(0.5, Math.min(10, Math.round((cur + delta) * 10) / 10));
    this.formData.expiryYears = next;
    this.updateProductExpiryFromYears();
    this.focusGroupInput(event);
  }

  onProductExactExpiryChange(): void {
    if (this.formData.mfgDate && this.formData.expiryDate) {
      const mfg = new Date(this.formData.mfgDate).getTime();
      const exp = new Date(this.formData.expiryDate).getTime();
      if (exp > mfg) {
        const yrs = Math.round(((exp - mfg) / (365.25 * 86400000)) * 2) / 2;
        this.formData.expiryYears = Math.max(0.5, yrs);
      }
    }
  }

  private updateProductExpiryFromYears(): void {
    const mfg = this.formData.mfgDate || this.todayIso();
    const yrs = Number(this.formData.expiryYears) || 2;
    this.formData.expiryDate = this.calculateExpiryFromYears(mfg, yrs);
  }

  // ── Expiry & Shelf Life Handlers (Batch Form) ─────────────────────────────
  setBatchExpiryMode(mode: ExpiryMode): void {
    this.batchFormData.expiryMode = mode;
    if (mode === 'years') {
      if (!this.batchFormData.expiryYears || this.batchFormData.expiryYears <= 0) {
        this.batchFormData.expiryYears = 2;
      }
      this.updateBatchExpiryFromYears();
    } else {
      if (!this.batchFormData.expiryDate && this.batchFormData.mfgDate) {
        this.batchFormData.expiryDate = this.calculateExpiryFromYears(this.batchFormData.mfgDate, this.batchFormData.expiryYears || 2);
      }
    }
  }

  onBatchMfgDateChange(): void {
    if (this.batchFormData.expiryMode === 'years') {
      this.updateBatchExpiryFromYears();
    } else {
      this.onBatchExactExpiryChange();
    }
  }

  onBatchExpiryYearsChange(): void {
    this.updateBatchExpiryFromYears();
  }

  setBatchQuickExpiryYears(years: number): void {
    this.batchFormData.expiryYears = years;
    this.updateBatchExpiryFromYears();
  }

  adjustBatchExpiryYears(delta: number, event?: Event): void {
    const cur = Number(this.batchFormData.expiryYears) || 0;
    const next = Math.max(0.5, Math.min(10, Math.round((cur + delta) * 10) / 10));
    this.batchFormData.expiryYears = next;
    this.updateBatchExpiryFromYears();
    this.focusGroupInput(event);
  }

  onBatchExactExpiryChange(): void {
    if (this.batchFormData.mfgDate && this.batchFormData.expiryDate) {
      const mfg = new Date(this.batchFormData.mfgDate).getTime();
      const exp = new Date(this.batchFormData.expiryDate).getTime();
      if (exp > mfg) {
        const yrs = Math.round(((exp - mfg) / (365.25 * 86400000)) * 2) / 2;
        this.batchFormData.expiryYears = Math.max(0.5, yrs);
      }
    }
  }

  private updateBatchExpiryFromYears(): void {
    const mfg = this.batchFormData.mfgDate || this.todayIso();
    const yrs = Number(this.batchFormData.expiryYears) || 2;
    this.batchFormData.expiryDate = this.calculateExpiryFromYears(mfg, yrs);
  }

  // ── CRUD Actions ──────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(product: Product): void {
    this.isEditMode.set(true);
    this.selectedProduct.set(product);
    const primBatch = this.primaryBatch(product);
    const mfgDate = primBatch?.mfgDate || this.todayIso();
    const expiryDate = primBatch?.expiryDate || this.calculateExpiryFromYears(mfgDate, 2);

    let expiryYears = 2;
    if (mfgDate && expiryDate) {
      const mfg = new Date(mfgDate).getTime();
      const exp = new Date(expiryDate).getTime();
      if (exp > mfg) {
        expiryYears = Math.max(0.5, Math.round(((exp - mfg) / (365.25 * 86400000)) * 2) / 2);
      }
    }

    this.formData = {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      unit: product.unit,
      batchNumber: primBatch?.batchNumber || this.suggestNextBatchNumber(),
      mfgDate,
      expiryMode: 'years',
      expiryYears,
      expiryDate,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
      isPrivateLabel: !!product.isPrivateLabel,
      status: product.status,
      description: product.description || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedProduct()) {
      this.openEditModal(this.selectedProduct()!);
    } else {
      this.formData = this.emptyForm();
    }
  }

  saveProduct(): void {
    const name = this.formData.name.trim();
    const sku = this.formData.sku.trim().toUpperCase();
    const barcode = this.formData.barcode.trim();
    const category = this.formData.category;
    const unit = this.formData.unit;
    const batchNumber = (this.formData.batchNumber || this.suggestNextBatchNumber()).trim().toUpperCase();
    const mfgDate = this.formData.mfgDate || this.todayIso();
    const expiryDate = this.formData.expiryDate || this.calculateExpiryFromYears(mfgDate, 2);
    const sellingPrice = this.round2(Number(this.formData.sellingPrice) || 0);
    const costPrice = this.round2(Number(this.formData.costPrice) || 0);
    const currentStock = Math.max(0, Math.round(Number(this.formData.currentStock) || 0));
    const minStock = Math.max(0, Math.round(Number(this.formData.minStock) || 0));

    if (!name) {
      alert('Product name is required.');
      return;
    }

    if (!sku) {
      alert('Product SKU / code is required.');
      return;
    }

    if (!expiryDate) {
      alert('Batch expiry date is required.');
      return;
    }

    if (sellingPrice < 0 || costPrice < 0) {
      alert('Prices cannot be negative.');
      return;
    }

    const editingId = this.isEditMode() ? this.selectedProduct()?.id : undefined;

    // Check duplicate SKU
    if (this.products().some(p => p.id !== editingId && p.sku.toUpperCase() === sku)) {
      alert(`A product with SKU "${sku}" already exists.`);
      return;
    }

    if (editingId !== undefined) {
      this.products.update(list =>
        list.map(p => {
          if (p.id !== editingId) return p;

          // Update primary batch or existing batches
          let updatedBatches = p.batches ? [...p.batches] : [];
          if (updatedBatches.length > 0) {
            updatedBatches[0] = {
              ...updatedBatches[0],
              batchNumber,
              mfgDate,
              expiryDate,
              quantity: currentStock,
              costPrice,
              sellingPrice
            };
          } else {
            updatedBatches = [{
              id: Date.now(),
              batchNumber,
              mfgDate,
              expiryDate,
              quantity: currentStock,
              costPrice,
              sellingPrice,
              status: currentStock > 0 ? 'Active' : 'Depleted'
            }];
          }

          return {
            ...p,
            name,
            sku,
            barcode,
            category,
            unit,
            batches: updatedBatches,
            sellingPrice,
            costPrice,
            currentStock,
            minStock,
            isPrivateLabel: !!this.formData.isPrivateLabel,
            status: this.formData.status,
            description: this.formData.description.trim() || undefined
          };
        })
      );
    } else {
      const newId = Math.max(0, ...this.products().map(p => p.id)) + 1;
      const initialBatch: ProductBatch = {
        id: Date.now(),
        batchNumber,
        mfgDate,
        expiryDate,
        quantity: currentStock,
        costPrice,
        sellingPrice,
        status: currentStock > 0 ? 'Active' : 'Depleted'
      };

      const newProduct: Product = {
        id: newId,
        name,
        sku,
        barcode,
        category,
        unit,
        batches: [initialBatch],
        sellingPrice,
        costPrice,
        currentStock,
        minStock,
        isPrivateLabel: !!this.formData.isPrivateLabel,
        status: this.formData.status,
        description: this.formData.description.trim() || undefined,
        createdAt: this.todayIso()
      };
      this.products.update(list => [newProduct, ...list]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})?`);
    if (!confirmed) return;

    this.products.update(list => list.filter(p => p.id !== product.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  // ── View Product Details Modal ─────────────────────────────────────────────
  openViewModal(product: Product): void {
    this.viewingProduct.set(product);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
  }

  editFromView(): void {
    const prod = this.viewingProduct();
    if (!prod) return;
    this.closeViewModal();
    this.openEditModal(prod);
  }

  // ── Add Batch Modal Actions ────────────────────────────────────────────────
  openAddBatchModal(product: Product): void {
    this.batchProduct.set(product);
    const mfg = this.todayIso();
    const defaultYears = 2;
    this.batchFormData = {
      batchNumber: this.suggestNextBatchNumber(),
      mfgDate: mfg,
      expiryMode: 'years',
      expiryYears: defaultYears,
      expiryDate: this.calculateExpiryFromYears(mfg, defaultYears),
      quantity: 100,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice
    };
    this.showBatchModal.set(true);
  }

  closeBatchModal(): void {
    this.showBatchModal.set(false);
  }

  saveNewBatch(): void {
    const prod = this.batchProduct();
    if (!prod) return;

    const bNum = this.batchFormData.batchNumber.trim().toUpperCase();
    const qty = Math.max(0, Math.round(Number(this.batchFormData.quantity) || 0));
    const cost = this.round2(Number(this.batchFormData.costPrice) || 0);
    const selling = this.round2(Number(this.batchFormData.sellingPrice) || 0);
    const mfgDate = this.batchFormData.mfgDate || this.todayIso();
    const expiryDate = this.batchFormData.expiryDate;

    if (!bNum) {
      alert('Batch number is required.');
      return;
    }

    if (!expiryDate) {
      alert('Expiry date is required.');
      return;
    }

    if (qty <= 0) {
      alert('Batch quantity must be greater than 0.');
      return;
    }

    const newBatch: ProductBatch = {
      id: Date.now(),
      batchNumber: bNum,
      mfgDate,
      expiryDate,
      quantity: qty,
      costPrice: cost,
      sellingPrice: selling,
      status: 'Active'
    };

    this.products.update(list =>
      list.map(p => {
        if (p.id !== prod.id) return p;
        const updatedBatches = [...(p.batches || []), newBatch];
        const newTotalStock = updatedBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
        return {
          ...p,
          batches: updatedBatches,
          currentStock: newTotalStock,
          sellingPrice: selling, // latest batch selling price
          costPrice: cost        // latest batch cost price
        };
      })
    );

    // If currently viewing this product, refresh view
    if (this.viewingProduct()?.id === prod.id) {
      const updated = this.products().find(p => p.id === prod.id) || null;
      this.viewingProduct.set(updated);
    }

    this.closeBatchModal();
  }
}
