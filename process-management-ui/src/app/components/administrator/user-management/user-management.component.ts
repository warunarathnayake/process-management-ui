import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  epfNicNo?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent {

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery   = signal('');
  filterStatus  = signal<'All' | 'Active' | 'Inactive'>('All');
  showModal     = signal(false);
  isEditMode    = signal(false);
  selectedUser  = signal<User | null>(null);

  users = signal<User[]>([
    { id: 1, epfNicNo: 'EPF-1001', name: 'Alice Johnson',  email: 'alice@example.com',  role: 'Admin',   department: 'IT',          status: 'Active',   createdAt: '2024-01-15' },
    { id: 2, epfNicNo: 'EPF-1002', name: 'Bob Smith',      email: 'bob@example.com',    role: 'Manager', department: 'Operations',  status: 'Active',   createdAt: '2024-02-20' },
    { id: 3, epfNicNo: 'EPF-1003', name: 'Carol White',    email: 'carol@example.com',  role: 'Staff',   department: 'HR',          status: 'Inactive', createdAt: '2024-03-10' },
    { id: 4, epfNicNo: 'EPF-1004', name: 'David Brown',    email: 'david@example.com',  role: 'Staff',   department: 'Finance',     status: 'Active',   createdAt: '2024-04-05' },
    { id: 5, epfNicNo: 'EPF-1005', name: 'Eva Martinez',   email: 'eva@example.com',    role: 'Manager', department: 'Logistics',   status: 'Active',   createdAt: '2024-05-18' },
    { id: 6, epfNicNo: 'EPF-1006', name: 'Frank Miller',   email: 'frank@example.com',  role: 'Manager', department: 'Procurement', status: 'Active',   createdAt: '2024-06-12' },
    { id: 7, epfNicNo: 'EPF-1007', name: 'Grace Lee',      email: 'grace@example.com',  role: 'Staff',   department: 'IT',          status: 'Active',   createdAt: '2024-07-01' },
    { id: 8, epfNicNo: 'EPF-1008', name: 'Henry Wilson',   email: 'henry@example.com',  role: 'Staff',   department: 'Operations',  status: 'Inactive', createdAt: '2024-08-15' },
  ]);

  // Form model
  formData: Omit<User, 'id' | 'createdAt'> = {
    epfNicNo: '', name: '', email: '', role: '', department: '', status: 'Active'
  };

  // ── Pagination State ──────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(5);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredUsers = computed(() => {
    const q      = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    return this.users().filter(u => {
      const matchesSearch = !q ||
        (u.epfNicNo && u.epfNicNo.toLowerCase().includes(q)) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || u.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  totalPages = computed(() => {
    const count = this.filteredUsers().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  showingFrom = computed(() => {
    return this.filteredUsers().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredUsers().length);
  });

  totalUsers    = computed(() => this.users().length);
  activeUsers   = computed(() => this.users().filter(u => u.status === 'Active').length);
  inactiveUsers = computed(() => this.users().filter(u => u.status === 'Inactive').length);

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.formData = { epfNicNo: '', name: '', email: '', role: '', department: '', status: 'Active' };
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.isEditMode.set(true);
    this.selectedUser.set(user);
    this.formData = { epfNicNo: user.epfNicNo || '', name: user.name, email: user.email, role: user.role, department: user.department, status: user.status };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  resetForm(): void {
    if (this.isEditMode() && this.selectedUser()) {
      const u = this.selectedUser()!;
      this.formData = {
        epfNicNo: u.epfNicNo || '',
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        status: u.status
      };
    } else {
      this.formData = {
        epfNicNo: '',
        name: '',
        email: '',
        role: '',
        department: '',
        status: 'Active'
      };
    }
  }

  saveUser(): void {
    if (this.isEditMode()) {
      this.users.update(list =>
        list.map(u => u.id === this.selectedUser()!.id ? { ...u, ...this.formData } : u)
      );
    } else {
      const newId = Math.max(0, ...this.users().map(u => u.id)) + 1;
      const today = new Date().toISOString().split('T')[0];
      this.users.update(list => [...list, { id: newId, createdAt: today, ...this.formData }]);
    }
    this.closeModal();
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users.update(list => list.filter(u => u.id !== id));
      if (this.currentPage() > this.totalPages()) {
        this.currentPage.set(this.totalPages());
      }
    }
  }

  toggleStatus(user: User): void {
    this.users.update(list =>
      list.map(u => u.id === user.id
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
      )
    );
  }

  setFilter(status: string): void {
    this.filterStatus.set(status as 'All' | 'Active' | 'Inactive');
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }
}
