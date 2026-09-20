import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Tooltip } from 'bootstrap';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  @Input() userName: string = 'John Doe';
  @Input() designation: string = 'Operations Manager';
  
  @Output() logout = new EventEmitter<void>();

  @ViewChild('logoutBtn') logoutBtnRef!: ElementRef<HTMLButtonElement>;
  private tooltip?: Tooltip;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    if (this.logoutBtnRef?.nativeElement) {
      this.tooltip = new Tooltip(this.logoutBtnRef.nativeElement, {
        placement: 'bottom',
        trigger: 'hover focus'
      });
    }
  }

  ngOnDestroy(): void {
    if (this.tooltip) {
      this.tooltip.dispose();
    }
  }

  onLogout(): void {
    if (this.tooltip) {
      this.tooltip.hide();
    }
    if (this.logout.observed) {
      this.logout.emit();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
