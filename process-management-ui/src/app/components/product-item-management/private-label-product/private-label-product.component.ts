import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export interface CatalogProductOption {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
}

export interface CustomerOption {
  id: number;
  name: string;
  code: string;
}

export interface PrivateLabelProduct {
  id: number;
  productId: number;
  customerId: number;
  brandName: string;
  status: 'Active' | 'Inactive';
}

export interface PrivateLabelFormData {
  productId: number;
  customerId: number;
  brandName: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-private-label-product',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './private-label-product.component.html',
  styleUrls: ['./private-label-product.component.scss']
})
export class PrivateLabelProductComponent {

  // ── Catalog Products (product_id reference) ─────────────────────────────────
  readonly productsList: CatalogProductOption[] = [
    { id: 1,  name: 'Rosewater Hydrating Face Mist',          sku: 'PRD-SKN-001', category: 'Facial Skincare',     unit: 'Bottle (100ml)' },
    { id: 2,  name: 'Niacinamide 10% + Zinc Serum',           sku: 'PRD-SKN-002', category: 'Facial Skincare',     unit: 'Dropper Bottle (30ml)' },
    { id: 3,  name: 'Botanical Ceramide Barrier Cream',       sku: 'PRD-SKN-003', category: 'Facial Skincare',     unit: 'Jar (50g)' },
    { id: 4,  name: 'Whipped Shea & Cocoa Body Butter',       sku: 'PRD-BDY-004', category: 'Body Care',           unit: 'Tub (200ml)' },
    { id: 5,  name: 'Exfoliating Himalayan Salt Scrub',       sku: 'PRD-BDY-005', category: 'Body Care',           unit: 'Jar (200ml)' },
    { id: 6,  name: 'Keratin Nourishing Hair Mask',           sku: 'PRD-HAR-006', category: 'Hair Care',           unit: 'Jar (200ml)' },
    { id: 7,  name: 'Argan & Rosemary Scalp Oil',             sku: 'PRD-HAR-007', category: 'Hair Care',           unit: 'Dropper Bottle (50ml)' },
    { id: 8,  name: 'Tinted Peptide Overnight Lip Mask',      sku: 'PRD-LIP-008', category: 'Lip Care',            unit: 'Pot (15g)' },
    { id: 9,  name: 'Velvet Matte Weightless Foundation',     sku: 'PRD-MAK-009', category: 'Color Cosmetics',     unit: 'Pump Bottle (30ml)' },
    { id: 10, name: 'Eau de Parfum - Jasmine & Oud',          sku: 'PRD-FRG-010', category: 'Fragrances',          unit: 'Bottle (50ml)' },
    { id: 11, name: 'Invisible Mineral Sunscreen SPF 50',     sku: 'PRD-SUN-011', category: 'Sun Care',            unit: 'Tube (50ml)' },
    { id: 12, name: 'Sandalwood Beard Grooming Elixir',       sku: 'PRD-MEN-012', category: "Men's Grooming",      unit: 'Bottle (30ml)' },
    { id: 13, name: 'Soothing Organic Calendula Baby Wash',   sku: 'PRD-BAB-013', category: 'Baby & Kids Care',    unit: 'Pump Bottle (250ml)' },
    { id: 14, name: 'Aromatherapy Botanical Bath Salts',      sku: 'PRD-BTH-014', category: 'Bath & Spa',          unit: 'Pouch (500g)' },
    { id: 15, name: 'Luxury Glow 4-Piece Discovery Gift Set', sku: 'PRD-GFT-015', category: 'Gift Sets & Bundles', unit: 'Box (set)' }
  ];

  // ── Customers (customer_id reference) ───────────────────────────────────────
  readonly customersList: CustomerOption[] = [
    { id: 1, name: 'Ceylon Luxe Spa & Wellness',     code: 'CUS-001' },
    { id: 2, name: 'Serene Grand Hotels & Resorts',  code: 'CUS-002' },
    { id: 3, name: 'Aura Botanics Retail Ltd.',      code: 'CUS-003' },
    { id: 4, name: 'Velvet & Vine Beauty Boutiques', code: 'CUS-004' },
    { id: 5, name: 'PureGlow Aesthetics Clinic',     code: 'CUS-005' },
    { id: 6, name: 'Lotus & Fern Eco Resort',        code: 'CUS-006' },
    { id: 7, name: "Gentlemen's Barber Co.",         code: 'CUS-007' },
    { id: 8, name: 'Little Blossom Baby Care',       code: 'CUS-008' }
  ];

  // ── Filters & Search ────────────────────────────────────────────────────────
  searchQuery    = signal('');
  customerFilter = signal<string>('All');
  statusFilter   = signal<string>('All');

  // ── Pagination State ────────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Modal State ─────────────────────────────────────────────────────────────
  showModal    = signal(false);
  isEditMode   = signal(false);
  selectedItem = signal<PrivateLabelProduct | null>(null);

  formData: PrivateLabelFormData = {
    productId: 1,
    customerId: 1,
    brandName: '',
    status: 'Active'
  };

  // ── Initial Mock Dataset (15 Private Label Products) ───────────────────────
  privateLabelProducts = signal<PrivateLabelProduct[]>([
    { id: 1,  productId: 1,  customerId: 1, brandName: 'Ceylon Dew Botanics',   status: 'Active' },
    { id: 2,  productId: 2,  customerId: 5, brandName: 'PureGlow DermaLab',     status: 'Active' },
    { id: 3,  productId: 3,  customerId: 3, brandName: 'Aura Skin Essentials',  status: 'Active' },
    { id: 4,  productId: 4,  customerId: 2, brandName: 'Serene Sanctuary Spa',  status: 'Active' },
    { id: 5,  productId: 5,  customerId: 1, brandName: 'Ceylon Luxe Rituals',   status: 'Active' },
    { id: 6,  productId: 6,  customerId: 4, brandName: 'Velvet Mane Studio',    status: 'Active' },
    { id: 7,  productId: 7,  customerId: 3, brandName: 'Aura Botanical Hair',   status: 'Active' },
    { id: 8,  productId: 8,  customerId: 4, brandName: 'Vine & Petal Beauty',   status: 'Active' },
    { id: 9,  productId: 9,  customerId: 4, brandName: 'Velvet Atelier',        status: 'Active' },
    { id: 10, productId: 10, customerId: 2, brandName: 'Maison Serene Privé',   status: 'Active' },
    { id: 11, productId: 11, customerId: 5, brandName: 'PureGlow SunShield',    status: 'Active' },
    { id: 12, productId: 12, customerId: 7, brandName: 'Ironwood Grooming Co.', status: 'Active' },
    { id: 13, productId: 13, customerId: 8, brandName: 'Little Blossom Organics', status: 'Active' },
    { id: 14, productId: 14, customerId: 6, brandName: 'Lotus & Fern Wellness', status: 'Active' },
    { id: 15, productId: 15, customerId: 2, brandName: 'Serene Royal Collection', status: 'Inactive' }
  ]);

  // ── Lookup Helpers ──────────────────────────────────────────────────────────
  getProduct(productId: number): CatalogProductOption | undefined {
    return this.productsList.find(p => p.id === Number(productId));
  }

  getCustomer(customerId: number): CustomerOption | undefined {
    return this.customersList.find(c => c.id === Number(customerId));
  }

  // ── Computed Signals ────────────────────────────────────────────────────────
  filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cust = this.customerFilter();
    const st = this.statusFilter();

    return this.privateLabelProducts().filter(item => {
      const product = this.getProduct(item.productId);
      const customer = this.getCustomer(item.customerId);

      const matchSearch = !q ||
        item.brandName.toLowerCase().includes(q) ||
        (product?.name.toLowerCase().includes(q) ?? false) ||
        (product?.sku.toLowerCase().includes(q) ?? false) ||
        (product?.category.toLowerCase().includes(q) ?? false) ||
        (customer?.name.toLowerCase().includes(q) ?? false) ||
        (customer?.code.toLowerCase().includes(q) ?? false);

      const matchCustomer = cust === 'All' || item.customerId === Number(cust);
      const matchStatus = st === 'All' || item.status === st;

      return matchSearch && matchCustomer && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredItems().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredItems().length)
  );

  // ── Filter & Pagination Actions ─────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setCustomerFilter(customerId: string): void {
    this.customerFilter.set(customerId);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── CRUD Actions ────────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.formData = {
      productId: this.productsList[0].id,
      customerId: this.customersList[0].id,
      brandName: '',
      status: 'Active'
    };
    this.showModal.set(true);
  }

  openEditModal(item: PrivateLabelProduct): void {
    this.isEditMode.set(true);
    this.selectedItem.set(item);
    this.formData = {
      productId: item.productId,
      customerId: item.customerId,
      brandName: item.brandName,
      status: item.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedItem()) {
      const item = this.selectedItem()!;
      this.formData = {
        productId: item.productId,
        customerId: item.customerId,
        brandName: item.brandName,
        status: item.status
      };
    } else {
      this.formData = {
        productId: this.productsList[0].id,
        customerId: this.customersList[0].id,
        brandName: '',
        status: 'Active'
      };
    }
  }

  saveItem(): void {
    const brandName = this.formData.brandName.trim();
    const productId = Number(this.formData.productId);
    const customerId = Number(this.formData.customerId);

    if (!brandName) {
      alert('Brand name is required.');
      return;
    }

    const duplicate = this.privateLabelProducts().some(item =>
      (!this.isEditMode() || item.id !== this.selectedItem()!.id) &&
      item.productId === productId &&
      item.customerId === customerId &&
      item.brandName.toLowerCase() === brandName.toLowerCase()
    );

    if (duplicate) {
      alert(`A private label mapping for this product, customer, and brand "${brandName}" already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedItem()) {
      this.privateLabelProducts.update(list =>
        list.map(item =>
          item.id === this.selectedItem()!.id
            ? {
                ...item,
                productId,
                customerId,
                brandName,
                status: this.formData.status
              }
            : item
        )
      );
    } else {
      const newId = Math.max(0, ...this.privateLabelProducts().map(i => i.id)) + 1;
      const newItem: PrivateLabelProduct = {
        id: newId,
        productId,
        customerId,
        brandName,
        status: this.formData.status
      };
      this.privateLabelProducts.update(list => [newItem, ...list]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  deleteItem(item: PrivateLabelProduct): void {
    const product = this.getProduct(item.productId);
    const confirmed = confirm(
      `Are you sure you want to delete private label brand "${item.brandName}" (${product?.name ?? 'Product'})?`
    );
    if (!confirmed) return;

    this.privateLabelProducts.update(list => list.filter(i => i.id !== item.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(item: PrivateLabelProduct): void {
    this.privateLabelProducts.update(list =>
      list.map(i =>
        i.id === item.id
          ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' }
          : i
      )
    );
  }

  // ── UI Badge & Icon Helpers ─────────────────────────────────────────────────
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Facial Skincare':     return 'bi-droplet-half';
      case 'Body Care':           return 'bi-moisture';
      case 'Hair Care':           return 'bi-magic';
      case 'Lip Care':            return 'bi-heart';
      case 'Color Cosmetics':     return 'bi-palette';
      case 'Fragrances':          return 'bi-flower1';
      case 'Sun Care':            return 'bi-sun';
      case "Men's Grooming":      return 'bi-person-badge';
      case 'Baby & Kids Care':    return 'bi-emoji-smile';
      case 'Bath & Spa':          return 'bi-water';
      case 'Gift Sets & Bundles': return 'bi-gift';
      default:                    return 'bi-box2';
    }
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Facial Skincare':     return 'cat-badge-skincare';
      case 'Body Care':           return 'cat-badge-body';
      case 'Hair Care':           return 'cat-badge-hair';
      case 'Lip Care':            return 'cat-badge-lip';
      case 'Color Cosmetics':     return 'cat-badge-makeup';
      case 'Fragrances':          return 'cat-badge-fragrance';
      case 'Sun Care':            return 'cat-badge-sun';
      case "Men's Grooming":      return 'cat-badge-men';
      case 'Baby & Kids Care':    return 'cat-badge-baby';
      case 'Bath & Spa':          return 'cat-badge-bath';
      case 'Gift Sets & Bundles': return 'cat-badge-gift';
      default:                    return 'cat-badge-default';
    }
  }
}
