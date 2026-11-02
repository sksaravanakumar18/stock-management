import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';

export type DynamicGridCellType = 'text' | 'number' | 'date' | 'badge' | 'actions';
export type DynamicGridBadgeTone = 'success' | 'warning' | 'error' | 'brand' | 'neutral';

export interface DynamicGridAction {
    id: string;
    label: string;
    variant?: 'default' | 'brand' | 'danger';
    disabled?: boolean;
}

export interface DynamicGridColumn {
    key: string;
    label: string;
    type?: DynamicGridCellType;
    sortable?: boolean;
    align?: 'start' | 'center' | 'end';
    badgeTones?: Record<string, DynamicGridBadgeTone>;
    actions?: DynamicGridAction[];
}

export interface DynamicGridActionEvent {
    actionId: string;
    row: unknown;
}

@Component({
    selector: 'app-dynamic-grid',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-4">
      @if (showSearch) {
        <div class="flex justify-end">
          <input
            type="search"
            class="h-11 w-full max-w-sm rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            [placeholder]="searchPlaceholder"
            [value]="searchText"
            (input)="onSearchInput($event)"
          />
        </div>
      }

      <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              @for (column of columns; track column.key) {
                <th
                  scope="col"
                  class="px-5 py-3 text-xs font-medium  text-gray-500 dark:text-gray-400"
                  [ngClass]="alignmentClass(column.align)"
                  [attr.aria-sort]="ariaSort(column)"
                >
                  @if (column.sortable && column.type !== 'actions') {
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-white"
                      (click)="sortBy(column)"
                    >
                      {{ column.label }}
                      @if (sortKey === column.key) {
                        <span>{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                      }
                    </button>
                  } @else {
                    {{ column.label }}
                  }
                </th>
              }
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            @for (row of pageRows; track trackRow($index, row)) {
              <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                @for (column of columns; track column.key) {
                  <td
                    class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300"
                    [ngClass]="alignmentClass(column.align)"
                  >
                    @switch (column.type ?? 'text') {
                      @case ('badge') {
                        <span
                          class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                          [ngClass]="badgeClass(row, column)"
                        >
                          {{ displayValue(row, column) }}
                        </span>
                      }

                      @case ('actions') {
                        <div class="flex flex-wrap items-center gap-2">
                          @for (action of column.actions ?? []; track action.id) {
                            <button
                              type="button"
                              class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                              [ngClass]="actionClass(action.variant)"
                              [disabled]="action.disabled ?? false"
                              (click)="triggerAction(action.id, row)"
                            >
                              {{ action.label }}
                            </button>
                          }
                        </div>
                      }

                      @default {
                        {{ displayValue(row, column) }}
                      }
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td
                  class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  [attr.colspan]="columns.length || 1"
                >
                  {{ emptyMessage }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredRows.length }} record{{ filteredRows.length === 1 ? '' : 's' }}
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            [disabled]="currentPage <= 1"
            (click)="goToPage(currentPage - 1)"
          >
            Previous
          </button>

          <span class="text-sm text-gray-600 dark:text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            type="button"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            [disabled]="currentPage >= totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            Next
          </button>

          <select
            class="h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            [value]="pageSize"
            aria-label="Rows per page"
            (change)="onPageSizeChange($event)"
          >
            @for (size of pageSizeOptions; track size) {
              <option [value]="size">{{ size }} per page</option>
            }
          </select>
        </div>
      </div>
    </div>
  `,
})
export class DynamicGridComponent implements OnChanges {
    @Input() columns: DynamicGridColumn[] = [];
    @Input() rows: unknown[] = [];
    @Input() rowKey = 'id';
    @Input() showSearch = true;
    @Input() searchPlaceholder = 'Search records...';
    @Input() emptyMessage = 'No records found.';
    @Input() pageSize = 10;

    @Output() actionTriggered = new EventEmitter<DynamicGridActionEvent>();

    readonly pageSizeOptions = [10, 25, 50];
    searchText = '';
    currentPage = 1;
    sortKey = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['rows']) {
            console.log('Grid rows changed:', this.rows.length, 'records, resetting to page 1');
            this.currentPage = 1;
            this.searchText = '';
            this.sortKey = '';
            this.sortDirection = 'asc';
            this.cdr.markForCheck();
        }
    }

    get filteredRows(): unknown[] {
        const query = this.searchText.trim().toLowerCase();
        if (!query) return this.rows;

        return this.rows.filter(row =>
            this.columns.some(column =>
                column.type !== 'actions' &&
                this.displayValue(row, column).toLowerCase().includes(query),
            ),
        );
    }

    get sortedRows(): unknown[] {
        if (!this.sortKey) return this.filteredRows;

        const column = this.columns.find(item => item.key === this.sortKey);
        if (!column) return this.filteredRows;

        return [...this.filteredRows].sort((a, b) => {
            const left = this.readPath(a, column.key);
            const right = this.readPath(b, column.key);

            let result: number;
            if (typeof left === 'number' && typeof right === 'number') {
                result = left - right;
            } else {
                result = this.valueText(left).localeCompare(this.valueText(right), undefined, {
                    numeric: true,
                    sensitivity: 'base',
                });
            }

            return this.sortDirection === 'asc' ? result : -result;
        });
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.sortedRows.length / this.pageSize));
    }

    get pageRows(): unknown[] {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        console.log('pageRows: showing rows', start, 'to', end, 'from total', this.sortedRows.length);
        return this.sortedRows.slice(start, end);
    }

    onSearchInput(event: Event): void {
        this.searchText = (event.target as HTMLInputElement).value;
        this.currentPage = 1;
    }

    onPageSizeChange(event: Event): void {
        const value = Number((event.target as HTMLSelectElement).value);
        if (Number.isFinite(value) && value > 0) {
            this.pageSize = value;
            this.currentPage = 1;
        }
    }

    sortBy(column: DynamicGridColumn): void {
        if (!column.sortable || column.type === 'actions') return;

        if (this.sortKey === column.key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = column.key;
            this.sortDirection = 'asc';
        }

        this.currentPage = 1;
    }

    goToPage(page: number): void {
        this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
    }

    trackRow(index: number, row: unknown): unknown {
        const key = this.readPath(row, this.rowKey);
        return key ?? row ?? index;
    }

    displayValue(row: unknown, column: DynamicGridColumn): string {
        const value = this.readPath(row, column.key);

        if (value === undefined || value === null) return '';
        if (column.type === 'date') {
            const date = value instanceof Date ? value : new Date(String(value));
            return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
        }

        return this.valueText(value);
    }

    badgeClass(row: unknown, column: DynamicGridColumn): string {
        const value = this.displayValue(row, column);
        const tone = column.badgeTones?.[value] ?? 'neutral';

        switch (tone) {
            case 'success':
                return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400';
            case 'warning':
                return 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400';
            case 'error':
                return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400';
            case 'brand':
                return 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    }

    alignmentClass(align: DynamicGridColumn['align']): string {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'end':
                return 'text-end';
            default:
                return 'text-start';
        }
    }

    ariaSort(column: DynamicGridColumn): string | null {
        if (!column.sortable || column.key !== this.sortKey) return null;
        return this.sortDirection === 'asc' ? 'ascending' : 'descending';
    }

    actionClass(variant: DynamicGridAction['variant']): string {
        switch (variant) {
            case 'brand':
                return 'bg-brand-500 text-white hover:bg-brand-600';
            case 'danger':
                return 'bg-error-50 text-error-700 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400';
            default:
                return 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5';
        }
    }

    triggerAction(actionId: string, row: unknown): void {
        this.actionTriggered.emit({ actionId, row });
    }

    private readPath(source: unknown, path: string): unknown {
        return path.split('.').reduce<unknown>((value, key) => {
            if (value === null || typeof value !== 'object' || !(key in value)) {
                return undefined;
            }

            return (value as Record<string, unknown>)[key];
        }, source);
    }

    private valueText(value: unknown): string {
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'boolean') {
            return value ? 'Active' : 'Inactive';
        }
        if (typeof value === 'string' || typeof value === 'number') {
            return String(value);
        }
        return '';
    }
}