import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  WritableSignal,
  inject
} from '@angular/core';

/**
 * Auto Page Size
 * ----------------------------------------------------------------------------
 * Place on the scrollable table wrapper (`.table-responsive`) of a page that
 * uses the `page-fill` layout. It measures the available height and the height
 * of a table row, then updates the page-size signal so that exactly the number
 * of rows that fit in the window are shown — no vertical scrolling.
 *
 * Re-calculates automatically when the window / panel is resized.
 *
 * Usage:
 *   <div class="table-responsive"
 *        [appAutoPageSize]="pageSize"
 *        [autoPageSizeCurrentPage]="currentPage">
 */
@Directive({
  selector: '[appAutoPageSize]',
  standalone: true
})
export class AutoPageSizeDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  /** Page-size signal to update. */
  @Input({ required: true, alias: 'appAutoPageSize' }) pageSize!: WritableSignal<number>;

  /** Optional current-page signal; kept in range so the first visible row stays visible. */
  @Input('autoPageSizeCurrentPage') currentPage?: WritableSignal<number>;

  /** Row height used until a real data row has been rendered and measured. */
  @Input('autoPageSizeRowHeight') fallbackRowHeight = 56;

  /** Lower bound for the number of rows per page. */
  @Input('autoPageSizeMin') minRows = 1;

  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private lastRowHeight = 0;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.schedule());
      this.resizeObserver.observe(this.host.nativeElement);

      // Also observe the table so a newly rendered row height is picked up.
      const table = this.host.nativeElement.querySelector('table');
      if (table) {
        this.resizeObserver.observe(table);
      }
      this.schedule();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  private schedule(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.recalculate());
  }

  private recalculate(): void {
    const el = this.host.nativeElement;
    const available = el.clientHeight;
    if (available <= 0) return;

    const thead = el.querySelector('thead') as HTMLElement | null;
    const headerHeight = thead ? thead.getBoundingClientRect().height : 0;

    const rowHeight = this.measureRowHeight();
    const bodySpace = available - headerHeight;

    // Small tolerance (1px) to avoid sub-pixel rounding causing an overflow.
    const rows = Math.max(this.minRows, Math.floor((bodySpace - 1) / rowHeight));

    if (rows === this.pageSize()) return;

    this.zone.run(() => {
      const oldSize = this.pageSize();
      if (this.currentPage) {
        // Keep the first visible record on screen after the page size changes.
        const firstIndex = (this.currentPage() - 1) * oldSize;
        this.currentPage.set(Math.floor(firstIndex / rows) + 1);
      }
      this.pageSize.set(rows);
    });
  }

  /** Tallest rendered data row (ignores the empty-state row with colspan). */
  private measureRowHeight(): number {
    const rows = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLTableRowElement>('tbody > tr')
    ).filter(tr => !tr.querySelector('td[colspan]'));

    const measured = rows.reduce((max, tr) => Math.max(max, tr.getBoundingClientRect().height), 0);
    if (measured > 0) {
      this.lastRowHeight = Math.ceil(measured);
    }
    return this.lastRowHeight || this.fallbackRowHeight;
  }
}

