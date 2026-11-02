import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private paginationSubject = new BehaviorSubject<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });

  public pagination$: Observable<PaginationState> = this.paginationSubject.asObservable();

  getPaginationState(): PaginationState {
    return this.paginationSubject.value;
  }

  setPageSize(pageSize: number): void {
    if (pageSize <= 0) throw new Error('Page size must be greater than 0');
    this.paginationSubject.next({
      ...this.paginationSubject.value,
      pageSize,
      currentPage: 1,
    });
  }

  setCurrentPage(page: number): void {
    const state = this.paginationSubject.value;
    if (page < 1) throw new Error('Page number must be greater than 0');
    const maxPage = this.getTotalPages();
    if (page > maxPage && maxPage > 0) throw new Error(`Page ${page} exceeds total pages ${maxPage}`);
    this.paginationSubject.next({
      ...state,
      currentPage: page,
    });
  }

  setTotalItems(total: number): void {
    if (total < 0) throw new Error('Total items cannot be negative');
    const state = this.paginationSubject.value;
    this.paginationSubject.next({
      ...state,
      totalItems: total,
      currentPage: 1,
    });
  }

  getTotalPages(): number {
    const { totalItems, pageSize } = this.paginationSubject.value;
    return Math.ceil(totalItems / pageSize);
  }

  getStartIndex(): number {
    const { currentPage, pageSize } = this.paginationSubject.value;
    return (currentPage - 1) * pageSize;
  }

  getEndIndex(): number {
    const { currentPage, pageSize, totalItems } = this.paginationSubject.value;
    const endIndex = currentPage * pageSize;
    return Math.min(endIndex, totalItems);
  }

  isPreviousAvailable(): boolean {
    return this.paginationSubject.value.currentPage > 1;
  }

  isNextAvailable(): boolean {
    const state = this.paginationSubject.value;
    return state.currentPage < this.getTotalPages();
  }

  goToFirstPage(): void {
    this.setCurrentPage(1);
  }

  goToLastPage(): void {
    const maxPage = this.getTotalPages();
    if (maxPage > 0) this.setCurrentPage(maxPage);
  }

  goToPreviousPage(): void {
    const current = this.paginationSubject.value.currentPage;
    if (current > 1) this.setCurrentPage(current - 1);
  }

  goToNextPage(): void {
    const state = this.paginationSubject.value;
    const maxPage = this.getTotalPages();
    if (state.currentPage < maxPage) this.setCurrentPage(state.currentPage + 1);
  }

  reset(): void {
    this.paginationSubject.next({
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
    });
  }

  paginateArray<T>(items: T[]): T[] {
    const { currentPage, pageSize } = this.paginationSubject.value;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }
}
