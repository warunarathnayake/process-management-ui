import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface ProductCategoryFormData {
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss']
})
export class ProductCategoryComponent {

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery      = signal('');
  statusFilter     = signal<string>('All');
  showModal        = signal(false);
  isEditMode       = signal(false);
  selectedCategory = signal<ProductCategory | null>(null);

  // Form Model
  formData: ProductCategoryFormData = {
    name: '',
    code: '',
    description: '',
    status: 'Active'
  };

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Initial Mock Dataset (12 Cosmetic Product Categories) ─────────────────
  categories = signal<ProductCategory[]>([
    {
      id: 1,
      name: 'Facial Skincare',
      code: 'SKIN',
      description: 'Cleansers, toners, serums, moisturizers, and face masks for daily skincare routines',
      productCount: 32,
      status: 'Active',
      createdAt: '2026-01-11'
    },
    {
      id: 2,
      name: 'Body Care',
      code: 'BODY',
      description: 'Body lotions, butters, scrubs, and shower gels for full-body nourishment',
      productCount: 24,
      status: 'Active',
      createdAt: '2026-01-12'
    },
    {
      id: 3,
      name: 'Hair Care',
      code: 'HAIR',
      description: 'Shampoos, conditioners, hair oils, masks, and scalp treatments',
      productCount: 19,
      status: 'Active',
      createdAt: '2026-01-13'
    },
    {
      id: 4,
      name: 'Lip Care',
      code: 'LIPC',
      description: 'Lip balms, lip scrubs, tinted lip oils, and overnight lip masks',
      productCount: 12,
      status: 'Active',
      createdAt: '2026-01-14'
    },
    {
      id: 5,
      name: 'Color Cosmetics',
      code: 'MAKE',
      description: 'Foundations, concealers, blushes, eyeshadows, and lipsticks',
      productCount: 41,
      status: 'Active',
      createdAt: '2026-01-15'
    },
    {
      id: 6,
      name: 'Fragrances',
      code: 'FRAG',
      description: 'Eau de parfum, body mists, roll-on perfume oils, and solid perfumes',
      productCount: 16,
      status: 'Active',
      createdAt: '2026-01-16'
    },
    {
      id: 7,
      name: 'Sun Care',
      code: 'SUNC',
      description: 'Mineral and chemical sunscreens, after-sun gels, and SPF moisturizers',
      productCount: 9,
      status: 'Active',
      createdAt: '2026-02-17'
    },
    {
      id: 8,
      name: 'Men\'s Grooming',
      code: 'MENS',
      description: 'Beard oils, shaving creams, aftershave balms, and men\'s face washes',
      productCount: 11,
      status: 'Active',
      createdAt: '2026-02-18'
    },
    {
      id: 9,
      name: 'Baby & Kids Care',
      code: 'BABY',
      description: 'Gentle tear-free washes, baby lotions, and diaper rash creams',
      productCount: 7,
      status: 'Active',
      createdAt: '2026-02-19'
    },
    {
      id: 10,
      name: 'Bath & Spa',
      code: 'BATH',
      description: 'Bath bombs, bath salts, soaking oils, and aromatherapy spa kits',
      productCount: 14,
      status: 'Active',
      createdAt: '2026-02-20'
    },
    {
      id: 11,
      name: 'Gift Sets & Bundles',
      code: 'GIFT',
      description: 'Curated seasonal gift boxes, travel kits, and value bundles',
      productCount: 8,
      status: 'Inactive',
      createdAt: '2026-02-21'
    },
    {
      id: 12,
      name: 'Travel & Mini Sizes',
      code: 'MINI',
      description: 'Travel-size and sample products for trials and promotions',
      productCount: 5,
      status: 'Inactive',
      createdAt: '2026-02-22'
    }
  ]);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.statusFilter();

    return this.categories().filter(c => {
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchStatus = s === 'All' || c.status === s;

      return matchSearch && matchStatus;
    });
  });

  totalPages = computed(() => {
    const count = this.filteredCategories().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCategories().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() => {
    return this.filteredCategories().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredCategories().length);
  });

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

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── CRUD Actions ──────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedCategory.set(null);
    this.formData = {
      name: '',
      code: '',
      description: '',
      status: 'Active'
    };
    this.showModal.set(true);
  }

  openEditModal(category: ProductCategory): void {
    this.isEditMode.set(true);
    this.selectedCategory.set(category);
    this.formData = {
      name: category.name,
      code: category.code,
      description: category.description || '',
      status: category.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedCategory()) {
      const c = this.selectedCategory()!;
      this.formData = {
        name: c.name,
        code: c.code,
        description: c.description || '',
        status: c.status
      };
    } else {
      this.formData = {
        name: '',
        code: '',
        description: '',
        status: 'Active'
      };
    }
  }

  saveCategory(): void {
    const name = this.formData.name.trim();
    const code = this.formData.code.trim().toUpperCase();
    const description = this.formData.description.trim();

    if (!name) {
      alert('Category name is required.');
      return;
    }

    if (!code) {
      alert('Category code is required.');
      return;
    }

    // Check duplicate name or code
    const duplicate = this.categories().some(c =>
      (!this.isEditMode() || c.id !== this.selectedCategory()!.id) &&
      (c.name.toLowerCase() === name.toLowerCase() || c.code.toUpperCase() === code)
    );

    if (duplicate) {
      alert(`A category with this name or code already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedCategory()) {
      this.categories.update(list =>
        list.map(c =>
          c.id === this.selectedCategory()!.id
            ? { ...c, name, code, description, status: this.formData.status }
            : c
        )
      );
    } else {
      const newId = Math.max(0, ...this.categories().map(c => c.id)) + 1;
      const newCategory: ProductCategory = {
        id: newId,
        name,
        code,
        description,
        productCount: 0,
        status: this.formData.status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.categories.update(list => [newCategory, ...list]);
    }

    this.closeModal();
  }

  deleteCategory(category: ProductCategory): void {
    if (category.productCount > 0) {
      const confirmed = confirm(
        `Category "${category.name} (${category.code})" is currently assigned to ${category.productCount} product(s).\nDeleting this category may affect catalog organization. Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Are you sure you want to delete category "${category.name} (${category.code})"?`);
      if (!confirmed) return;
    }

    this.categories.update(list => list.filter(c => c.id !== category.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(category: ProductCategory): void {
    this.categories.update(list =>
      list.map(c =>
        c.id === category.id
          ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' }
          : c
      )
    );
  }

  // ── Helper Icon Resolver ──────────────────────────────────────────────────
  getCategoryIcon(_code?: string): string {
    return 'bi-tags';
  }
}
