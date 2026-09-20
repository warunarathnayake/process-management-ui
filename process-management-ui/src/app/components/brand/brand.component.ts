import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() showSubtitle: boolean = false;
  @Input() subtitle: string = 'Aithusa PVT LTD';
}
