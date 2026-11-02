import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DateRange {
  fromDate: string;
  toDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class DateRangeFilterService {
  private dateRangeSubject = new BehaviorSubject<DateRange>({
    fromDate: '',
    toDate: '',
  });

  public dateRange$: Observable<DateRange> = this.dateRangeSubject.asObservable();

  getDateRange(): DateRange {
    return this.dateRangeSubject.value;
  }

  setDateRange(fromDate: string, toDate: string): void {
    if (toDate && fromDate && toDate < fromDate) {
      throw new Error('End date must be after start date');
    }
    this.dateRangeSubject.next({ fromDate, toDate });
  }

  setFromDate(fromDate: string): void {
    const current = this.dateRangeSubject.value;
    if (current.toDate && fromDate && current.toDate < fromDate) {
      throw new Error('End date must be after start date');
    }
    this.dateRangeSubject.next({ ...current, fromDate });
  }

  setToDate(toDate: string): void {
    const current = this.dateRangeSubject.value;
    if (toDate && current.fromDate && toDate < current.fromDate) {
      throw new Error('End date must be after start date');
    }
    this.dateRangeSubject.next({ ...current, toDate });
  }

  clear(): void {
    this.dateRangeSubject.next({ fromDate: '', toDate: '' });
  }

  isValid(): boolean {
    const { fromDate, toDate } = this.dateRangeSubject.value;
    if (!fromDate || !toDate) return true;
    return toDate >= fromDate;
  }

  getDaysDifference(): number {
    const { fromDate, toDate } = this.dateRangeSubject.value;
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  }
}
