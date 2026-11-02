import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      @for (notification of notifications; track notification.id) {
        <div
          [ngClass]="{
            'bg-success-50 border-success-500 dark:bg-success-500/15 dark:border-success-500/30': notification.type === 'success',
            'bg-error-50 border-error-500 dark:bg-error-500/15 dark:border-error-500/30': notification.type === 'error',
            'bg-warning-50 border-warning-500 dark:bg-warning-500/15 dark:border-warning-500/30': notification.type === 'warning',
            'bg-blue-light-50 border-blue-light-500 dark:bg-blue-light-500/15 dark:border-blue-light-500/30': notification.type === 'info'
          }"
          class="border-l-4 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4 duration-300 max-w-md"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1">
              @if (notification.title) {
                <h3
                  [ngClass]="{
                    'text-success-700 dark:text-success-400': notification.type === 'success',
                    'text-error-700 dark:text-error-400': notification.type === 'error',
                    'text-warning-700 dark:text-warning-400': notification.type === 'warning',
                    'text-blue-light-700 dark:text-blue-light-400': notification.type === 'info'
                  }"
                  class="font-medium text-sm"
                >
                  {{ notification.title }}
                </h3>
              }
              <p
                [ngClass]="{
                  'text-success-600 dark:text-success-300': notification.type === 'success',
                  'text-error-600 dark:text-error-300': notification.type === 'error',
                  'text-warning-600 dark:text-warning-300': notification.type === 'warning',
                  'text-blue-light-600 dark:text-blue-light-300': notification.type === 'info'
                }"
                class="text-sm"
              >
                {{ notification.message }}
              </p>
            </div>
            @if (notification.dismissible) {
              <button
                type="button"
                (click)="notificationService.dismiss(notification.id)"
                [ngClass]="{
                  'text-success-500 hover:text-success-600': notification.type === 'success',
                  'text-error-500 hover:text-error-600': notification.type === 'error',
                  'text-warning-500 hover:text-warning-600': notification.type === 'warning',
                  'text-blue-light-500 hover:text-blue-light-600': notification.type === 'info'
                }"
                class="font-semibold text-lg"
              >
                ✕
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastNotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });
  }
}
