import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  materialCount: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface MaterialCategoryFormData {
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-material-category',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './material-category.component.html',
  styleUrls: ['./material-category.component.scss']
})
export class MaterialCategoryComponent {

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery      = signal('');
  statusFilter     = signal<string>('All');
  showModal        = signal(false);
  isEditMode       = signal(false);
  selectedCategory = signal<MaterialCategory | null>(null);

  // Form Model
  formData: MaterialCategoryFormData = {
    name: '',
    code: '',
    description: '',
    status: 'Active'
  };

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Initial Mock Dataset (12 Cosmetics Industry Categories) ───────────────
  categories = signal<MaterialCategory[]>([
    {
      id: 1,
      name: 'Oils, Butters & Waxes',
      code: 'OBW',
      description: 'Cold-pressed carrier oils, shea butter, beeswax, jojoba, and plant-derived lipids',
      materialCount: 28,
      status: 'Active',
      createdAt: '2026-01-10'
    },
    {
      id: 2,
      name: 'Surfactants & Foaming Agents',
      code: 'SURF',
      description: 'Primary and secondary surfactants, betaines, glucosides, and gentle cleansing bases',
      materialCount: 21,
      status: 'Active',
      createdAt: '2026-01-12'
    },
    {
      id: 3,
      name: 'Active Ingredients & Peptides',
      code: 'ACTV',
      description: 'Hyaluronic acid, niacinamide, retinoids, ceramides, and anti-aging bio-peptides',
      materialCount: 34,
      status: 'Active',
      createdAt: '2026-01-15'
    },
    {
      id: 4,
      name: 'Emulsifiers & Solubilizers',
      code: 'EMUL',
      description: 'Oil-in-water and water-in-oil emulsifiers, cetearyl alcohol, and polysorbates',
      materialCount: 16,
      status: 'Active',
      createdAt: '2026-01-18'
    },
    {
      id: 5,
      name: 'Fragrances & Essential Oils',
      code: 'FRAG',
      description: 'Cosmetic-grade perfume oils, pure essential oils, distillates, and aroma blends',
      materialCount: 42,
      status: 'Active',
      createdAt: '2026-01-20'
    },
    {
      id: 6,
      name: 'Colorants, Dyes & Mica',
      code: 'COLR',
      description: 'Mineral pigments, iron oxides, pearlescent mica powders, and FDA-certified lakes',
      materialCount: 39,
      status: 'Active',
      createdAt: '2026-02-01'
    },
    {
      id: 7,
      name: 'Botanical & Herbal Extracts',
      code: 'BOTA',
      description: 'Centella asiatica, green tea, aloe vera leaf extract, chamomile, and herbal tinctures',
      materialCount: 25,
      status: 'Active',
      createdAt: '2026-02-05'
    },
    {
      id: 8,
      name: 'Humectants & Hydrators',
      code: 'HUMT',
      description: 'Vegetable glycerin, propanediol, hyaluronic complexes, and natural moisture factors',
      materialCount: 14,
      status: 'Active',
      createdAt: '2026-02-10'
    },
    {
      id: 9,
      name: 'Preservatives & Antioxidants',
      code: 'PRES',
      description: 'Broad-spectrum antimicrobial systems, phenoxyethanol, tocopherols, and BHT',
      materialCount: 12,
      status: 'Active',
      createdAt: '2026-02-15'
    },
    {
      id: 10,
      name: 'Thickeners & Texture Modifiers',
      code: 'THIK',
      description: 'Carbomers, xanthan gum, hydroxyethylcellulose, and rheology adjusting polymers',
      materialCount: 11,
      status: 'Active',
      createdAt: '2026-02-20'
    },
    {
      id: 11,
      name: 'Primary Packaging & Containers',
      code: 'PPKG',
      description: 'Amber glass dropper bottles, airless pump dispensers, cosmetic jars, and lip tubes',
      materialCount: 47,
      status: 'Inactive',
      createdAt: '2026-02-25'
    },
    {
      id: 12,
      name: 'Secondary Packaging & Labels',
      code: 'SPKG',
      description: 'Unit cartons, foil stamped labels, tamper-evident seals, and protective sleeves',
      materialCount: 18,
      status: 'Inactive',
      createdAt: '2026-03-01'
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

  openEditModal(category: MaterialCategory): void {
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
      const newCategory: MaterialCategory = {
        id: newId,
        name,
        code,
        description,
        materialCount: 0,
        status: this.formData.status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.categories.update(list => [newCategory, ...list]);
    }

    this.closeModal();
  }

  deleteCategory(category: MaterialCategory): void {
    if (category.materialCount > 0) {
      const confirmed = confirm(
        `Category "${category.name} (${category.code})" is currently assigned to ${category.materialCount} material(s).\nDeleting this category may affect inventory organization. Are you sure you want to proceed?`
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

  toggleStatus(category: MaterialCategory): void {
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
    return 'bi-boxes';
  }
}
