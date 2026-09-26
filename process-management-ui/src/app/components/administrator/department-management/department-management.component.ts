import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Department {
  id: number;
  name: string;
  description?: string;
  userCount?: number;
}

export interface DepartmentFormData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.scss']
})
export class DepartmentManagementComponent {

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery        = signal('');
  showModal          = signal(false);
  isEditMode         = signal(false);
  selectedDepartment = signal<Department | null>(null);

  departments = signal<Department[]>([
    {
      id: 1,
      name: 'IT',
      description: 'Information technology infrastructure, security systems, and internal software support',
      userCount: 2
    },
    {
      id: 2,
      name: 'Operations',
      description: 'Production workflows, day-to-day manufacturing, and operational fulfillment',
      userCount: 2
    },
    {
      id: 3,
      name: 'HR',
      description: 'Human resource management, staff onboarding, employee welfare, and company policies',
      userCount: 1
    },
    {
      id: 4,
      name: 'Finance',
      description: 'Financial accounting, taxation, expenditure audits, and organizational budgeting',
      userCount: 1
    },
    {
      id: 5,
      name: 'Logistics',
      description: 'Warehouse inventory storage, material dispatch, shipment freight, and couriers',
      userCount: 1
    },
    {
      id: 6,
      name: 'Procurement',
      description: 'Vendor relationship management, supplier sourcing, requisitions, and purchase orders',
      userCount: 1
    }
  ]);

  // Form Model
  formData: DepartmentFormData = {
    name: '',
    description: ''
  };

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredDepartments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.departments().filter(d => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = d.description ? d.description.toLowerCase().includes(q) : false;
      return !q || matchName || matchDesc;
    });
  });

  totalPages = computed(() => {
    const count = this.filteredDepartments().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedDepartments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredDepartments().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() => {
    return this.filteredDepartments().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredDepartments().length);
  });

  totalDepartments = computed(() => this.departments().length);
  totalUserCount   = computed(() => this.departments().reduce((sum, d) => sum + (d.userCount || 0), 0));

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedDepartment.set(null);
    this.formData = {
      name: '',
      description: ''
    };
    this.showModal.set(true);
  }

  openEditModal(dept: Department): void {
    this.isEditMode.set(true);
    this.selectedDepartment.set(dept);
    this.formData = {
      name: dept.name,
      description: dept.description || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedDepartment()) {
      this.formData = {
        name: this.selectedDepartment()!.name,
        description: this.selectedDepartment()!.description || ''
      };
    } else {
      this.formData = {
        name: '',
        description: ''
      };
    }
  }

  saveDepartment(): void {
    const trimmedName = this.formData.name.trim();
    const trimmedDesc = this.formData.description.trim();

    if (!trimmedName) {
      alert('Department name is required.');
      return;
    }

    // Check duplicate name
    const exists = this.departments().some(d =>
      d.name.toLowerCase() === trimmedName.toLowerCase() &&
      (!this.isEditMode() || d.id !== this.selectedDepartment()!.id)
    );

    if (exists) {
      alert(`A department with the name "${trimmedName}" already exists.`);
      return;
    }

    if (this.isEditMode() && this.selectedDepartment()) {
      this.departments.update(list =>
        list.map(d => d.id === this.selectedDepartment()!.id
          ? { ...d, name: trimmedName, description: trimmedDesc }
          : d
        )
      );
    } else {
      const newId = Math.max(0, ...this.departments().map(d => d.id)) + 1;
      const newDept: Department = {
        id: newId,
        name: trimmedName,
        description: trimmedDesc,
        userCount: 0
      };
      this.departments.update(list => [...list, newDept]);
    }

    this.closeModal();
  }

  deleteDepartment(dept: Department): void {
    if (dept.userCount && dept.userCount > 0) {
      const confirmed = confirm(
        `This department currently has ${dept.userCount} assigned user(s).\nAre you sure you want to delete "${dept.name}"?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Are you sure you want to delete "${dept.name}"?`);
      if (!confirmed) return;
    }

    this.departments.update(list => list.filter(d => d.id !== dept.id));
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }
}
