import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class SidebarComponent {
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
          expanded: true,
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
            { id: 'users', label: 'User Management', route: '/users' }
          ]
        }
      ]
    }
  ];

  @Output() menuSelect = new EventEmitter<MenuItem | SubMenuItem>();

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
      this.menuSelect.emit(item);
    }
  }

  onSelectSub(parent: MenuItem, sub: SubMenuItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedId = parent.id;
    this.selectedSubId = sub.id;
    this.menuSelect.emit(sub);
  }

  isSubActive(sub: SubMenuItem): boolean {
    return this.selectedSubId === sub.id;
  }
}
