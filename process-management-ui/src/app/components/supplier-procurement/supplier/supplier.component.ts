import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  supplyCategories: string[];
  paymentTerms: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface SupplierFormData {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  supplyCategories: string[];
  paymentTerms: string;
  address: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent {

  // ── Predefined Lists ──────────────────────────────────────────────────────
  readonly supplyCategories: string[] = [
    'Oils, Butters & Waxes',
    'Active Ingredients & Chemicals',
    'Surfactants & Emulsifiers',
    'Fragrances & Essential Oils',
    'Botanical Extracts',
    'Colorants & Pigments',
    'Packaging & Containers',
    'Labels & Printing',
    'General Supplies'
  ];

  readonly paymentTermsList: string[] = [
    'Cash on Delivery',
    'Advance Payment',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60'
  ];

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery      = signal('');
  categoryFilter   = signal('All');
  statusFilter     = signal('All');
  showModal        = signal(false);
  isEditMode       = signal(false);
  selectedSupplier = signal<Supplier | null>(null);

  formData: SupplierFormData = this.emptyForm();

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Initial Mock Dataset (Cosmetics Industry Suppliers) ───────────────────
  suppliers = signal<Supplier[]>([
    {
      id: 1,
      name: 'Shea Naturals Ltd.',
      code: 'SUP-001',
      contactPerson: 'Amara Mensah',
      email: 'amara@sheanaturals.com',
      phone: '+233 24 555 0142',
      supplyCategories: ['Oils, Butters & Waxes', 'Botanical Extracts'],
      paymentTerms: 'Net 30',
      address: '14 Independence Ave, Accra, Ghana',
      status: 'Active',
      createdAt: '2026-01-05'
    },
    {
      id: 2,
      name: 'ChemActive Supplies',
      code: 'SUP-002',
      contactPerson: 'Daniel Fischer',
      email: 'd.fischer@chemactive.de',
      phone: '+49 30 5550 1234',
      supplyCategories: ['Active Ingredients & Chemicals', 'Surfactants & Emulsifiers'],
      paymentTerms: 'Net 45',
      address: 'Industriestraße 42, 10115 Berlin, Germany',
      status: 'Active',
      createdAt: '2026-01-08'
    },
    {
      id: 3,
      name: 'Pure Glycerin Co.',
      code: 'SUP-003',
      contactPerson: 'Priya Raman',
      email: 'priya@pureglycerin.in',
      phone: '+91 98450 12345',
      supplyCategories: ['Surfactants & Emulsifiers', 'Oils, Butters & Waxes'],
      paymentTerms: 'Net 30',
      address: 'Plot 18, Guindy Industrial Estate, Chennai, India',
      status: 'Active',
      createdAt: '2026-01-12'
    },
    {
      id: 4,
      name: 'Rose Valley Aromatics',
      code: 'SUP-004',
      contactPerson: 'Ivan Petrov',
      email: 'ivan@rosevalley.bg',
      phone: '+359 88 555 7788',
      supplyCategories: ['Fragrances & Essential Oils', 'Botanical Extracts'],
      paymentTerms: 'Advance Payment',
      address: '23 Rozova Dolina Blvd, Kazanlak, Bulgaria',
      status: 'Active',
      createdAt: '2026-01-18'
    },
    {
      id: 5,
      name: 'Herbal Lanka Extracts',
      code: 'SUP-005',
      contactPerson: 'Nuwan Perera',
      email: 'nuwan@herballanka.lk',
      phone: '+94 77 555 6123',
      supplyCategories: ['Botanical Extracts', 'Oils, Butters & Waxes', 'Fragrances & Essential Oils'],
      paymentTerms: 'Net 15',
      address: 'No. 85, Biyagama Export Processing Zone, Colombo, Sri Lanka',
      status: 'Active',
      createdAt: '2026-01-22'
    },
    {
      id: 6,
      name: 'ColorTech Pigments',
      code: 'SUP-006',
      contactPerson: 'Sophie Laurent',
      email: 'sophie@colortech.fr',
      phone: '+33 1 5555 4321',
      supplyCategories: ['Colorants & Pigments', 'Active Ingredients & Chemicals'],
      paymentTerms: 'Net 60',
      address: '12 Rue de la Chimie, 69007 Lyon, France',
      status: 'Active',
      createdAt: '2026-02-02'
    },
    {
      id: 7,
      name: 'Amber Glass Packaging',
      code: 'SUP-007',
      contactPerson: 'Chen Wei',
      email: 'chen.wei@amberglass.cn',
      phone: '+86 21 5555 8890',
      supplyCategories: ['Packaging & Containers', 'Labels & Printing'],
      paymentTerms: 'Net 45',
      address: '88 Pudong Industrial Park, Shanghai, China',
      status: 'Active',
      createdAt: '2026-02-10'
    },
    {
      id: 8,
      name: 'PrintPro Labels',
      code: 'SUP-008',
      contactPerson: 'Kasun Fernando',
      email: 'kasun@printpro.lk',
      phone: '+94 71 555 2345',
      supplyCategories: ['Labels & Printing', 'Packaging & Containers', 'General Supplies'],
      paymentTerms: 'Cash on Delivery',
      address: 'No. 120, Peradeniya Road, Kandy, Sri Lanka',
      status: 'Active',
      createdAt: '2026-02-14'
    },
    {
      id: 9,
      name: 'Oleo Chemicals Malaysia',
      code: 'SUP-009',
      contactPerson: 'Aisyah Rahman',
      email: 'aisyah@oleochem.my',
      phone: '+60 3 5555 6677',
      supplyCategories: ['Surfactants & Emulsifiers', 'Active Ingredients & Chemicals'],
      paymentTerms: 'Net 30',
      address: 'Lot 9, Shah Alam Industrial Park, Kuala Lumpur, Malaysia',
      status: 'Inactive',
      createdAt: '2026-02-20'
    },
    {
      id: 10,
      name: 'NatureGum Thickeners',
      code: 'SUP-010',
      contactPerson: 'Lucas Oliveira',
      email: 'lucas@naturegum.com.br',
      phone: '+55 11 5555 3344',
      supplyCategories: ['Active Ingredients & Chemicals', 'Botanical Extracts'],
      paymentTerms: 'Net 60',
      address: 'Av. Paulista 1500, São Paulo, Brazil',
      status: 'Inactive',
      createdAt: '2026-03-01'
    }
  ]);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredSuppliers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const status = this.statusFilter();

    return this.suppliers().filter(s => {
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.supplyCategories.some(c => c.toLowerCase().includes(q));

      const matchCat = cat === 'All' || s.supplyCategories.includes(cat);
      const matchStatus = status === 'All' || s.status === status;

      return matchSearch && matchCat && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSuppliers().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedSuppliers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSuppliers().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredSuppliers().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredSuppliers().length)
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  private emptyForm(): SupplierFormData {
    return {
      name: '',
      code: this.nextSupplierCode(),
      contactPerson: '',
      email: '',
      phone: '',
      supplyCategories: [this.supplyCategories[0]],
      paymentTerms: 'Net 30',
      address: '',
      status: 'Active'
    };
  }

  private nextSupplierCode(): string {
    const list = this.suppliers?.() ?? [];
    const maxNum = list.reduce((max, s) => {
      const n = parseInt(s.code.replace(/\D/g, ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return `SUP-${String(maxNum + 1).padStart(3, '0')}`;
  }

  private formFromSupplier(s: Supplier): SupplierFormData {
    return {
      name: s.name,
      code: s.code,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      supplyCategories: [...s.supplyCategories],
      paymentTerms: s.paymentTerms,
      address: s.address,
      status: s.status
    };
  }

  isCategorySelected(cat: string): boolean {
    return this.formData.supplyCategories.includes(cat);
  }

  toggleSupplyCategory(cat: string): void {
    const idx = this.formData.supplyCategories.indexOf(cat);
    if (idx >= 0) {
      this.formData.supplyCategories = this.formData.supplyCategories.filter(c => c !== cat);
    } else {
      this.formData.supplyCategories = [...this.formData.supplyCategories, cat];
    }
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

  setCategoryFilter(cat: string): void {
    this.categoryFilter.set(cat);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── CRUD Actions ──────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedSupplier.set(null);
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(s: Supplier): void {
    this.isEditMode.set(true);
    this.selectedSupplier.set(s);
    this.formData = this.formFromSupplier(s);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    const s = this.selectedSupplier();
    this.formData = this.isEditMode() && s ? this.formFromSupplier(s) : this.emptyForm();
  }

  saveSupplier(): void {
    const name = this.formData.name.trim();
    const code = this.formData.code.trim().toUpperCase();
    const contactPerson = this.formData.contactPerson.trim();
    const email = this.formData.email.trim().toLowerCase();
    const phone = this.formData.phone.trim();

    if (!name) {
      alert('Supplier name is required.');
      return;
    }

    if (!code) {
      alert('Supplier code is required.');
      return;
    }

    if (!contactPerson) {
      alert('Contact person is required.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!phone) {
      alert('Phone number is required.');
      return;
    }

    if (this.formData.supplyCategories.length === 0) {
      alert('Please select at least one supply category.');
      return;
    }

    const editingId = this.isEditMode() ? this.selectedSupplier()?.id : undefined;

    if (this.suppliers().some(s => s.id !== editingId && s.code.toUpperCase() === code)) {
      alert(`A supplier with the code "${code}" already exists.`);
      return;
    }

    if (this.suppliers().some(s => s.id !== editingId && s.name.toLowerCase() === name.toLowerCase())) {
      alert(`A supplier named "${name}" already exists.`);
      return;
    }

    const payload = {
      name,
      code,
      contactPerson,
      email,
      phone,
      supplyCategories: [...this.formData.supplyCategories],
      paymentTerms: this.formData.paymentTerms,
      address: this.formData.address.trim(),
      status: this.formData.status
    };

    if (editingId !== undefined) {
      this.suppliers.update(list =>
        list.map(s => (s.id === editingId ? { ...s, ...payload } : s))
      );
    } else {
      const newId = Math.max(0, ...this.suppliers().map(s => s.id)) + 1;
      this.suppliers.update(list => [
        { id: newId, ...payload, createdAt: new Date().toISOString().split('T')[0] },
        ...list
      ]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  deleteSupplier(s: Supplier): void {
    const confirmed = confirm(`Are you sure you want to delete supplier "${s.name} (${s.code})"?`);
    if (!confirmed) return;

    this.suppliers.update(list => list.filter(item => item.id !== s.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(s: Supplier): void {
    this.suppliers.update(list =>
      list.map(item =>
        item.id === s.id
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      )
    );
  }
}
