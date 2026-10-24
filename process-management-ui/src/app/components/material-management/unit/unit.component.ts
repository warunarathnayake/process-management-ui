import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export type MeasurementType =
  | 'Mass / Weight'
  | 'Length / Dimension'
  | 'Volume / Liquid'
  | 'Count / Quantity'
  | 'Packaging / Container';

export interface UnitOfMeasure {
  id: number;
  name: string;
  code: string;
  type: MeasurementType;
  isBaseUnit?: boolean;
  baseUnitCode?: string;
  conversionFactor?: number;
  precision?: number;
  description?: string;
  materialsCount?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface UnitFormData {
  name: string;
  code?: string;
  type: MeasurementType;
  isBaseUnit?: boolean;
  baseUnitCode?: string;
  conversionFactor?: number;
  precision?: number;
  description?: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent {

  // ── Measurement Types ─────────────────────────────────────────────────────
  readonly measurementTypes: MeasurementType[] = [
    'Mass / Weight',
    'Length / Dimension',
    'Volume / Liquid',
    'Count / Quantity',
    'Packaging / Container'
  ];

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery   = signal('');
  typeFilter    = signal<string>('All');
  statusFilter  = signal<'All' | 'Active' | 'Inactive'>('All');
  showModal     = signal(false);
  isEditMode    = signal(false);
  selectedUnit  = signal<UnitOfMeasure | null>(null);

  units = signal<UnitOfMeasure[]>([
    {
      id: 1,
      name: 'Kilogram',
      code: 'kg',
      type: 'Mass / Weight',
      isBaseUnit: true,
      conversionFactor: 1,
      precision: 3,
      description: 'Standard SI metric base unit for raw material and mass weighing',
      materialsCount: 28,
      status: 'Active',
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      name: 'Gram',
      code: 'g',
      type: 'Mass / Weight',
      isBaseUnit: false,
      baseUnitCode: 'kg',
      conversionFactor: 0.001,
      precision: 3,
      description: 'Secondary mass unit for fine additives, pigments, and dyes',
      materialsCount: 14,
      status: 'Active',
      createdAt: '2024-01-12'
    },
    {
      id: 3,
      name: 'Metric Ton',
      code: 't',
      type: 'Mass / Weight',
      isBaseUnit: false,
      baseUnitCode: 'kg',
      conversionFactor: 1000,
      precision: 2,
      description: 'Heavy freight bulk materials and containerized feedstock',
      materialsCount: 6,
      status: 'Active',
      createdAt: '2024-01-15'
    },
    {
      id: 4,
      name: 'Meter',
      code: 'm',
      type: 'Length / Dimension',
      isBaseUnit: true,
      conversionFactor: 1,
      precision: 2,
      description: 'Standard base dimension for fabric rolls, tubing, and cable',
      materialsCount: 19,
      status: 'Active',
      createdAt: '2024-01-20'
    },
    {
      id: 5,
      name: 'Centimeter',
      code: 'cm',
      type: 'Length / Dimension',
      isBaseUnit: false,
      baseUnitCode: 'm',
      conversionFactor: 0.01,
      precision: 2,
      description: 'Intermediate dimension for trim, labels, and cutting margins',
      materialsCount: 8,
      status: 'Active',
      createdAt: '2024-02-05'
    },
    {
      id: 6,
      name: 'Millimeter',
      code: 'mm',
      type: 'Length / Dimension',
      isBaseUnit: false,
      baseUnitCode: 'm',
      conversionFactor: 0.001,
      precision: 1,
      description: 'Precision dimension for gauge thicknesses and tolerances',
      materialsCount: 12,
      status: 'Active',
      createdAt: '2024-02-10'
    },
    {
      id: 7,
      name: 'Liter',
      code: 'L',
      type: 'Volume / Liquid',
      isBaseUnit: true,
      conversionFactor: 1,
      precision: 2,
      description: 'Base volume unit for liquid chemicals, resins, and solvents',
      materialsCount: 22,
      status: 'Active',
      createdAt: '2024-02-18'
    },
    {
      id: 8,
      name: 'Milliliter',
      code: 'ml',
      type: 'Volume / Liquid',
      isBaseUnit: false,
      baseUnitCode: 'L',
      conversionFactor: 0.001,
      precision: 2,
      description: 'Fluid measurement for concentrated reagents and catalysts',
      materialsCount: 9,
      status: 'Active',
      createdAt: '2024-02-22'
    },
    {
      id: 9,
      name: 'Piece',
      code: 'pcs',
      type: 'Count / Quantity',
      isBaseUnit: true,
      conversionFactor: 1,
      precision: 0,
      description: 'Discrete countable units, individual parts, fittings, and items',
      materialsCount: 45,
      status: 'Active',
      createdAt: '2024-03-01'
    },
    {
      id: 10,
      name: 'Box',
      code: 'box',
      type: 'Packaging / Container',
      isBaseUnit: false,
      baseUnitCode: 'pcs',
      conversionFactor: 24,
      precision: 0,
      description: 'Standard packed carton containing 24 countable items',
      materialsCount: 16,
      status: 'Active',
      createdAt: '2024-03-12'
    },
    {
      id: 11,
      name: 'Roll',
      code: 'roll',
      type: 'Packaging / Container',
      isBaseUnit: false,
      baseUnitCode: 'm',
      conversionFactor: 50,
      precision: 2,
      description: 'Continuous web roll wound to standard 50 meter spool',
      materialsCount: 7,
      status: 'Active',
      createdAt: '2024-03-18'
    },
    {
      id: 12,
      name: 'Pallet',
      code: 'plt',
      type: 'Packaging / Container',
      isBaseUnit: false,
      baseUnitCode: 'box',
      conversionFactor: 40,
      precision: 0,
      description: 'Warehouse skid pallet holding 40 bulk cartons (Archived)',
      materialsCount: 3,
      status: 'Inactive',
      createdAt: '2024-04-02'
    }
  ]);

  // Form model
  formData: UnitFormData = {
    name: '',
    type: 'Mass / Weight',
    status: 'Active'
  };

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Computed Metrics & Filters ────────────────────────────────────────────
  totalUnits     = computed(() => this.units().length);
  activeUnits    = computed(() => this.units().filter(u => u.status === 'Active').length);
  inactiveUnits  = computed(() => this.units().filter(u => u.status === 'Inactive').length);
  baseUnitsCount = computed(() => this.units().filter(u => u.isBaseUnit).length);

  // Base units available in system for conversion linking
  availableBaseUnits = computed(() => {
    return this.units().filter(u => u.isBaseUnit);
  });

  filteredUnits = computed(() => {
    const q      = this.searchQuery().toLowerCase().trim();
    const type   = this.typeFilter();
    const status = this.statusFilter();

    return this.units().filter(u => {
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.type.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q));

      const matchesType   = type === 'All' || u.type === type;
      const matchesStatus = status === 'All' || u.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  totalPages = computed(() => {
    const count = this.filteredUnits().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedUnits = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUnits().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() => {
    return this.filteredUnits().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredUnits().length);
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // ── Search & Filter Handlers ──────────────────────────────────────────────
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setTypeFilter(type: string): void {
    this.typeFilter.set(type);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status as 'All' | 'Active' | 'Inactive');
    this.currentPage.set(1);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedUnit.set(null);
    this.formData = {
      name: '',
      type: 'Mass / Weight',
      status: 'Active'
    };
    this.showModal.set(true);
  }

  openEditModal(unit: UnitOfMeasure): void {
    this.isEditMode.set(true);
    this.selectedUnit.set(unit);
    this.formData = {
      name: unit.name,
      code: unit.code,
      type: unit.type,
      status: unit.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedUnit()) {
      const u = this.selectedUnit()!;
      this.formData = {
        name: u.name,
        code: u.code,
        type: u.type,
        status: u.status
      };
    } else {
      this.formData = {
        name: '',
        type: 'Mass / Weight',
        status: 'Active'
      };
    }
  }

  saveUnit(): void {
    const trimmedName = this.formData.name.trim();

    if (!trimmedName) {
      alert('Unit Name is required.');
      return;
    }

    // Check duplicate name (ignoring current edit)
    const duplicate = this.units().some(u =>
      (!this.isEditMode() || u.id !== this.selectedUnit()!.id) &&
      u.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      alert(`A unit with name "${trimmedName}" already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedUnit()) {
      this.units.update(list =>
        list.map(u => u.id === this.selectedUnit()!.id
          ? {
              ...u,
              name: trimmedName,
              type: this.formData.type,
              status: this.formData.status
            }
          : u
        )
      );
    } else {
      const newId = Math.max(0, ...this.units().map(u => u.id)) + 1;
      const today = new Date().toISOString().split('T')[0];
      const newUnit: UnitOfMeasure = {
        id: newId,
        name: trimmedName,
        code: this.formData.code?.trim() || trimmedName.slice(0, 3).toLowerCase(),
        type: this.formData.type,
        materialsCount: 0,
        status: this.formData.status,
        createdAt: today
      };
      this.departmentsOrUnitsAdd(newUnit);
    }

    this.closeModal();
  }

  private departmentsOrUnitsAdd(newUnit: UnitOfMeasure): void {
    this.units.update(list => [...list, newUnit]);
  }

  deleteUnit(unit: UnitOfMeasure): void {
    if (unit.materialsCount && unit.materialsCount > 0) {
      const confirmed = confirm(
        `Unit "${unit.name} (${unit.code})" is currently assigned to ${unit.materialsCount} material(s).\nDeleting this unit may affect stock records. Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Are you sure you want to delete unit "${unit.name} (${unit.code})"?`);
      if (!confirmed) return;
    }

    this.units.update(list => list.filter(u => u.id !== unit.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(unit: UnitOfMeasure): void {
    this.units.update(list =>
      list.map(u => u.id === unit.id
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
      )
    );
  }

  // ── Helper formatters & icons ─────────────────────────────────────────────
  getTypeIcon(type: MeasurementType): string {
    switch (type) {
      case 'Mass / Weight': return 'bi-speedometer2';
      case 'Length / Dimension': return 'bi-arrows-expand';
      case 'Volume / Liquid': return 'bi-droplet-half';
      case 'Count / Quantity': return 'bi-123';
      case 'Packaging / Container': return 'bi-box-seam';
      default: return 'bi-rulers';
    }
  }

  getTypeBadgeClass(type: MeasurementType): string {
    switch (type) {
      case 'Mass / Weight': return 'type-badge-weight';
      case 'Length / Dimension': return 'type-badge-length';
      case 'Volume / Liquid': return 'type-badge-volume';
      case 'Count / Quantity': return 'type-badge-count';
      case 'Packaging / Container': return 'type-badge-packaging';
      default: return 'type-badge-default';
    }
  }
}
