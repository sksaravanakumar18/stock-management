import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> =
    this.notificationsSubject.asObservable();

  private readonly DEFAULT_DURATION = 3000;

  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: { title?: string; duration?: number; dismissible?: boolean }
  ): void {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type,
      message,
      title: options?.title,
      duration: options?.duration ?? this.DEFAULT_DURATION,
      dismissible: options?.dismissible ?? true,
    };

    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...notifications, notification]);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => this.dismiss(notification.id), notification.duration);
    }
  }

  success(
    message: string,
    options?: { title?: string; duration?: number }
  ): void {
    this.show(message, 'success', options);
  }

  error(
    message: string,
    options?: { title?: string; duration?: number }
  ): void {
    this.show(message, 'error', { ...options, duration: options?.duration ?? 5000 });
  }

  warning(
    message: string,
    options?: { title?: string; duration?: number }
  ): void {
    this.show(message, 'warning', options);
  }

  info(
    message: string,
    options?: { title?: string; duration?: number }
  ): void {
    this.show(message, 'info', options);
  }

  dismiss(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(
      (n) => n.id !== notificationId
    );
    this.notificationsSubject.next(notifications);
  }

  dismissAll(): void {
    this.notificationsSubject.next([]);
  }
}
