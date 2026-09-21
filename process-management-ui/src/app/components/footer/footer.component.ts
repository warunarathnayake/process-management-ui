import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() companyName: string = 'Aithusa PVT LTD';
  @Input() systemName: string = 'Business Process Management System';
  @Input() currentYear: number = new Date().getFullYear();
  @Input() version: string = 'v1.0.0';
}
