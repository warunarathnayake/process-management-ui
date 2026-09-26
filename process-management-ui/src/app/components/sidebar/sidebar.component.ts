import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SubMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string | number;
  expanded?: boolean;
  children?: SubMenuItem[];
}

export interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);

  @Input() selectedId: string = 'dashboard';
  @Input() selectedSubId: string = '';

  @Input() menuGroups: MenuGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'bi-grid-1x2',
          route: '/dashboard'
        }
      ]
    },
    {
      title: 'SUPPLY CHAIN & INVENTORY',
      items: [
        {
          id: 'material-management',
          label: 'Material Management',
          icon: 'bi-boxes',
          expanded: false,
          children: [
            { id: 'materials', label: 'Materials & Stock', route: '/materials' },
            { id: 'material-categories', label: 'Material Categories', route: '/material-categories' },
            { id: 'units', label: 'Units of Measure', route: '/units' }
          ]
        },
        {
          id: 'supplier-purchase',
          label: 'Supplier & Procurement',
          icon: 'bi-building',
          expanded: false,
          children: [
            { id: 'suppliers', label: 'Suppliers', route: '/suppliers' },
            { id: 'purchase-orders', label: 'Purchase Orders', route: '/purchase-orders' },
            { id: 'purchase-payments', label: 'Purchase Payments', route: '/purchase-payments' }
          ]
        }
      ]
    },
    {
      title: 'SALES & FULFILLMENT',
      items: [
        {
          id: 'product-item-management',
          label: 'Product & Item Management',
          icon: 'bi-tag',
          expanded: false,
          children: [
            { id: 'products', label: 'Products & Catalog', route: '/products' },
            { id: 'product-categories', label: 'Product Categories', route: '/product-categories' },
            { id: 'product-pricing', label: 'Product Pricing', route: '/product-pricing' },
            { id: 'private-label', label: 'Private Label Products', route: '/private-label-products' }
          ]
        },
        {
          id: 'customer-management',
          label: 'Customer Management',
          icon: 'bi-people',
          expanded: false,
          children: [
            { id: 'customers', label: 'Customer Directory', route: '/customers' }
          ]
        },
        {
          id: 'sales-order-management',
          label: 'Sales Order Management',
          icon: 'bi-clipboard-check',
          expanded: false,
          children: [
            { id: 'sales-orders', label: 'Sales Orders', route: '/sales-orders' },
            { id: 'discounts', label: 'Discount Schemes', route: '/discounts' },
            { id: 'sales-payments', label: 'Order Payments', route: '/sales-payments' }
          ]
        },
        {
          id: 'dispatch-logistics',
          label: 'Dispatch & Logistics',
          icon: 'bi-truck',
          expanded: false,
          children: [
            { id: 'dispatches', label: 'Dispatches', route: '/dispatches' },
            { id: 'courier-services', label: 'Courier Services', route: '/courier-services' }
          ]
        }
      ]
    },
    {
      title: 'SYSTEM & CONFIGURATION',
      items: [
        {
          id: 'administrator',
          label: 'Administrator',
          icon: 'bi-shield-check',
          expanded: false,
          children: [
            { id: 'users', label: 'User Management', route: '/users' },
            { id: 'roles', label: 'Roles & Permissions', route: '/roles' },
            { id: 'departments', label: 'Department Management', route: '/departments' }
          ]
        }
      ]
    }
  ];

  @Output() menuSelect = new EventEmitter<MenuItem | SubMenuItem>();

  ngOnInit(): void {
    this.syncActiveMenuWithRoute(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.syncActiveMenuWithRoute(event.urlAfterRedirects || event.url);
    });
  }

  toggleExpand(item: MenuItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const willExpand = !item.expanded;
    // Accordion Mode: collapse others so only one expands
    this.menuGroups.forEach(group => {
      group.items.forEach(m => {
        if (m.id !== item.id) {
          m.expanded = false;
        }
      });
    });
    item.expanded = willExpand;
  }

  onSelectMain(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleExpand(item);
    } else {
      this.selectedId = item.id;
      this.selectedSubId = '';
      // Collapse all accordions when selecting a single link
      this.menuGroups.forEach(group => {
        group.items.forEach(m => {
          m.expanded = false;
        });
      });
      this.menuSelect.emit(item);
    }
  }

  onSelectSub(parent: MenuItem, sub: SubMenuItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedId = parent.id;
    this.selectedSubId = sub.id;

    // Keep parent expanded and collapse all other main menus
    this.menuGroups.forEach(group => {
      group.items.forEach(m => {
        m.expanded = (m.id === parent.id);
      });
    });

    this.menuSelect.emit(sub);
  }

  isMainActive(item: MenuItem): boolean {
    if (item.children && item.children.length > 0) {
      return (this.selectedId === item.id && !!this.selectedSubId) ||
        item.children.some(child => this.isSubActive(child));
    }
    return this.isSingleMainActive(item);
  }

  isSubActive(sub: SubMenuItem): boolean {
    if (this.selectedSubId === sub.id) {
      return true;
    }
    if (sub.route) {
      const currentPath = this.router.url.split('?')[0].split('#')[0];
      return currentPath === sub.route || currentPath.startsWith(sub.route + '/');
    }
    return false;
  }

  isSingleMainActive(item: MenuItem): boolean {
    if (this.selectedSubId) {
      // When a submenu is active, no single main menu (e.g. Dashboard) can be active
      return false;
    }
    if (item.route) {
      const currentPath = this.router.url.split('?')[0].split('#')[0];
      return currentPath === item.route;
    }
    return this.selectedId === item.id;
  }

  private syncActiveMenuWithRoute(url: string): void {
    if (!url) return;
    const currentPath = url.split('?')[0].split('#')[0];

    let matchedParentId: string | null = null;
    let matchedSubId: string | null = null;

    for (const group of this.menuGroups) {
      for (const item of group.items) {
        if (item.children && item.children.length > 0) {
          const matchedChild = item.children.find(child =>
            child.route && (currentPath === child.route || currentPath.startsWith(child.route + '/'))
          );
          if (matchedChild) {
            matchedParentId = item.id;
            matchedSubId = matchedChild.id;
            break;
          }
        } else if (item.route && (currentPath === item.route || currentPath.startsWith(item.route + '/'))) {
          matchedParentId = item.id;
          matchedSubId = '';
          break;
        }
      }
      if (matchedParentId) break;
    }

    if (matchedParentId) {
      this.selectedId = matchedParentId;
      this.selectedSubId = matchedSubId || '';

      // Set the matched parent to expanded, collapse all others
      this.menuGroups.forEach(group => {
        group.items.forEach(m => {
          m.expanded = (m.id === matchedParentId);
        });
      });
    }
  }
}
