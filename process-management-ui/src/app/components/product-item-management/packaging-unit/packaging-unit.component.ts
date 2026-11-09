import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoPageSizeDirective } from '../../../shared/directives/auto-page-size.directive';

export interface PackagingUnit {
  id: number;
  name: string;
  containerType: string;
  capacity: string;
  productsCount: number;
  status: 'Active' | 'Inactive';
}

export interface MeasurementUnitOption {
  code: string;
  label: string;
}

export interface PackagingUnitFormData {
  name: string;
  containerType: string;
  capacityValue: string;
  capacityUnit: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-packaging-unit',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoPageSizeDirective],
  templateUrl: './packaging-unit.component.html',
  styleUrls: ['./packaging-unit.component.scss']
})
export class PackagingUnitComponent {

  readonly measurementUnits: MeasurementUnitOption[] = [
    { code: 'ml',    label: 'Milliliter (ml)' },
    { code: 'L',     label: 'Liter (L)' },
    { code: 'g',     label: 'Gram (g)' },
    { code: 'kg',    label: 'Kilogram (kg)' },
    { code: 'mg',    label: 'Milligram (mg)' },
    { code: 'fl oz', label: 'Fluid Ounce (fl oz)' },
    { code: 'pcs',   label: 'Piece (pcs)' },
    { code: 'set',   label: 'Set (set)' }
  ];

  containerTypes = signal<string[]>([
    'Bottle',
    'Dropper Bottle',
    'Pump Bottle',
    'Jar & Tub',
    'Tube & Pouch',
    'Box & Set'
  ]);

  // ── Inline Container Type Add / Edit State ──────────────────────────────────
  containerTypeMode  = signal<'select' | 'add' | 'edit'>('select');
  containerTypeInput = '';

  // ── Filters & Search ────────────────────────────────────────────────────────
  searchQuery  = signal('');
  typeFilter   = signal('All');
  statusFilter = signal('All');

  // ── Pagination State ────────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Modal State ─────────────────────────────────────────────────────────────
  showModal    = signal(false);
  isEditMode   = signal(false);
  selectedUnit = signal<PackagingUnit | null>(null);

  formData: PackagingUnitFormData = {
    name: '',
    containerType: 'Bottle',
    capacityValue: '',
    capacityUnit: 'ml',
    status: 'Active'
  };

  // ── Initial Mock Dataset (15 Cosmetic Packaging Units) ─────────────────────
  units = signal<PackagingUnit[]>([
    { id: 1,  name: 'Bottle (30ml)',          containerType: 'Bottle',         capacity: '30 ml',  productsCount: 2, status: 'Active' },
    { id: 2,  name: 'Bottle (50ml)',          containerType: 'Bottle',         capacity: '50 ml',  productsCount: 3, status: 'Active' },
    { id: 3,  name: 'Bottle (100ml)',         containerType: 'Bottle',         capacity: '100 ml', productsCount: 4, status: 'Active' },
    { id: 4,  name: 'Dropper Bottle (30ml)',  containerType: 'Dropper Bottle', capacity: '30 ml',  productsCount: 5, status: 'Active' },
    { id: 5,  name: 'Dropper Bottle (50ml)',  containerType: 'Dropper Bottle', capacity: '50 ml',  productsCount: 2, status: 'Active' },
    { id: 6,  name: 'Pump Bottle (250ml)',    containerType: 'Pump Bottle',    capacity: '250 ml', productsCount: 3, status: 'Active' },
    { id: 7,  name: 'Jar (50g)',              containerType: 'Jar & Tub',      capacity: '50 g',   productsCount: 4, status: 'Active' },
    { id: 8,  name: 'Jar (200ml)',            containerType: 'Jar & Tub',      capacity: '200 ml', productsCount: 3, status: 'Active' },
    { id: 9,  name: 'Tub (200ml)',            containerType: 'Jar & Tub',      capacity: '200 ml', productsCount: 2, status: 'Active' },
    { id: 10, name: 'Pot (15g)',              containerType: 'Jar & Tub',      capacity: '15 g',   productsCount: 2, status: 'Active' },
    { id: 11, name: 'Tube (50ml)',            containerType: 'Tube & Pouch',   capacity: '50 ml',  productsCount: 3, status: 'Active' },
    { id: 12, name: 'Tube (75ml)',            containerType: 'Tube & Pouch',   capacity: '75 ml',  productsCount: 1, status: 'Active' },
    { id: 13, name: 'Pouch (500g)',           containerType: 'Tube & Pouch',   capacity: '500 g',  productsCount: 2, status: 'Active' },
    { id: 14, name: 'Box (set)',              containerType: 'Box & Set',      capacity: '1 set',  productsCount: 1, status: 'Active' },
    { id: 15, name: 'Piece (pcs)',            containerType: 'Box & Set',      capacity: '1 pcs',  productsCount: 0, status: 'Inactive' }
  ]);

  // ── Computed Signals ────────────────────────────────────────────────────────
  filteredUnits = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const t = this.typeFilter();
    const s = this.statusFilter();

    return this.units().filter(u => {
      const matchSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.containerType.toLowerCase().includes(q) ||
        u.capacity.toLowerCase().includes(q);

      const matchType = t === 'All' || u.containerType === t;
      const matchStatus = s === 'All' || u.status === s;

      return matchSearch && matchType && matchStatus;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUnits().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedUnits = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUnits().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() =>
    this.filteredUnits().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredUnits().length)
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

  setTypeFilter(type: string): void {
    this.typeFilter.set(type);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  // ── Inline Container Type Actions (Add / Edit / Delete) ────────────────────
  startAddContainerType(): void {
    this.containerTypeInput = '';
    this.containerTypeMode.set('add');
  }

  startEditContainerType(): void {
    if (!this.formData.containerType) return;
    this.containerTypeInput = this.formData.containerType;
    this.containerTypeMode.set('edit');
  }

  cancelContainerTypeAction(): void {
    this.containerTypeInput = '';
    this.containerTypeMode.set('select');
  }

  confirmContainerTypeAction(): void {
    const trimmed = this.containerTypeInput.trim();
    if (!trimmed) {
      alert('Please enter a container type name.');
      return;
    }

    if (this.containerTypeMode() === 'add') {
      const existing = this.containerTypes().find(
        t => t.toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) {
        this.formData.containerType = existing;
      } else {
        this.containerTypes.update(list => [...list, trimmed]);
        this.formData.containerType = trimmed;
      }
    } else if (this.containerTypeMode() === 'edit') {
      const oldType = this.formData.containerType;
      const duplicate = this.containerTypes().some(
        t => t !== oldType && t.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        alert(`A container type named "${trimmed}" already exists.`);
        return;
      }

      this.containerTypes.update(list =>
        list.map(t => (t === oldType ? trimmed : t))
      );
      this.units.update(list =>
        list.map(u => (u.containerType === oldType ? { ...u, containerType: trimmed } : u))
      );
      if (this.typeFilter() === oldType) {
        this.typeFilter.set(trimmed);
      }
      this.formData.containerType = trimmed;
    }

    this.containerTypeInput = '';
    this.containerTypeMode.set('select');
  }

  deleteSelectedContainerType(): void {
    const target = this.formData.containerType;
    if (!target) return;

    if (this.containerTypes().length <= 1) {
      alert('At least one container type must remain.');
      return;
    }

    const usedCount = this.units().filter(u => u.containerType === target).length;
    if (usedCount > 0) {
      alert(
        `Cannot delete "${target}" because it is assigned to ${usedCount} packaging unit(s).\nEdit or reassign those units first.`
      );
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete container type "${target}"?`);
    if (!confirmed) return;

    this.containerTypes.update(list => list.filter(t => t !== target));
    if (this.typeFilter() === target) {
      this.typeFilter.set('All');
    }
    this.formData.containerType = this.containerTypes()[0] || '';
  }

  // ── CRUD Actions ────────────────────────────────────────────────────────────
  private parseCapacity(capacity: string): { value: string; unit: string } {
    const trimmed = (capacity || '').trim();
    const match = trimmed.match(/^([\d.]+)\s*(.+)$/);
    if (match) {
      const val = match[1];
      const rawUnit = match[2].trim();
      const matchedUnit = this.measurementUnits.find(
        u => u.code.toLowerCase() === rawUnit.toLowerCase()
      );
      return {
        value: val,
        unit: matchedUnit ? matchedUnit.code : 'ml'
      };
    }
    return { value: trimmed, unit: 'ml' };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedUnit.set(null);
    this.containerTypeMode.set('select');
    this.containerTypeInput = '';
    this.formData = {
      name: '',
      containerType: this.containerTypes()[0] || 'Bottle',
      capacityValue: '',
      capacityUnit: 'ml',
      status: 'Active'
    };
    this.showModal.set(true);
  }

  openEditModal(unit: PackagingUnit): void {
    this.isEditMode.set(true);
    this.selectedUnit.set(unit);
    this.containerTypeMode.set('select');
    this.containerTypeInput = '';
    const parsed = this.parseCapacity(unit.capacity);
    this.formData = {
      name: unit.name,
      containerType: unit.containerType,
      capacityValue: parsed.value,
      capacityUnit: parsed.unit,
      status: unit.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.containerTypeMode.set('select');
    this.containerTypeInput = '';
    this.showModal.set(false);
  }

  resetForm(): void {
    this.containerTypeMode.set('select');
    this.containerTypeInput = '';
    if (this.isEditMode() && this.selectedUnit()) {
      const u = this.selectedUnit()!;
      const parsed = this.parseCapacity(u.capacity);
      this.formData = {
        name: u.name,
        containerType: u.containerType,
        capacityValue: parsed.value,
        capacityUnit: parsed.unit,
        status: u.status
      };
    } else {
      this.formData = {
        name: '',
        containerType: this.containerTypes()[0] || 'Bottle',
        capacityValue: '',
        capacityUnit: 'ml',
        status: 'Active'
      };
    }
  }

  saveUnit(): void {
    const name = this.formData.name.trim();
    const capacityVal = String(this.formData.capacityValue ?? '').trim();

    if (!name) {
      alert('Packaging unit name is required.');
      return;
    }

    if (!capacityVal) {
      alert('Net capacity / volume value is required.');
      return;
    }

    const capacity = `${capacityVal} ${this.formData.capacityUnit}`;

    const duplicate = this.units().some(u =>
      (!this.isEditMode() || u.id !== this.selectedUnit()!.id) &&
      u.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      alert(`A packaging unit named "${name}" already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedUnit()) {
      this.units.update(list =>
        list.map(u =>
          u.id === this.selectedUnit()!.id
            ? {
                ...u,
                name,
                containerType: this.formData.containerType,
                capacity,
                status: this.formData.status
              }
            : u
        )
      );
    } else {
      const newId = Math.max(0, ...this.units().map(u => u.id)) + 1;
      const newUnit: PackagingUnit = {
        id: newId,
        name,
        containerType: this.formData.containerType,
        capacity,
        productsCount: 0,
        status: this.formData.status
      };
      this.units.update(list => [newUnit, ...list]);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  deleteUnit(unit: PackagingUnit): void {
    if (unit.productsCount > 0) {
      const confirmed = confirm(
        `Packaging unit "${unit.name}" is currently assigned to ${unit.productsCount} product(s).\nAre you sure you want to delete it?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Are you sure you want to delete packaging unit "${unit.name}"?`);
      if (!confirmed) return;
    }

    this.units.update(list => list.filter(u => u.id !== unit.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  toggleStatus(unit: PackagingUnit): void {
    this.units.update(list =>
      list.map(u =>
        u.id === unit.id
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  }

  // ── UI Badge & Icon Helpers ─────────────────────────────────────────────────
  getTypeIcon(type: string): string {
    switch (type) {
      case 'Bottle':         return 'bi-droplet';
      case 'Dropper Bottle': return 'bi-eyedropper';
      case 'Pump Bottle':    return 'bi-moisture';
      case 'Jar & Tub':      return 'bi-archive';
      case 'Tube & Pouch':   return 'bi-capsule';
      case 'Box & Set':      return 'bi-box-seam';
      default:               return 'bi-box';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Bottle':         return 'type-badge-volume';
      case 'Dropper Bottle': return 'type-badge-length';
      case 'Pump Bottle':    return 'type-badge-weight';
      case 'Jar & Tub':      return 'type-badge-packaging';
      case 'Tube & Pouch':   return 'type-badge-count';
      case 'Box & Set':      return 'type-badge-default';
      default:               return 'type-badge-default';
    }
  }
}
