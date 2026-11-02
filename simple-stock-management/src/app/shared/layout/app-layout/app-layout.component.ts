import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { ToastNotificationComponent } from '../../components/notifications/toast-notification/toast-notification.component';
import { MasterDataApiService } from '../../services/master-data-api.service';
import { StockMasterDataService } from '../../services/stock-master-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    AppSidebarComponent,
    BackdropComponent,
    ToastNotificationComponent,
  ],
  templateUrl: './app-layout.component.html',
})

export class AppLayoutComponent implements OnInit, OnDestroy {
  readonly isExpanded$;
  readonly isHovered$;
  readonly isMobileOpen$;
  private destroy$ = new Subject<void>();

  constructor(
      public sidebarService: SidebarService,
      private masterDataApi: MasterDataApiService,
      private masterData: StockMasterDataService,
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  ngOnInit(): void {
    this.loadMasterData();
  }

  private loadMasterData(): void {
    // Products will be loaded in each component that needs them
    // No need to load globally as they're loaded per-page
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get containerClasses() {
    return [
      'flex-1',
      'transition-all',
      'duration-300',
      'ease-in-out',
      (this.isExpanded$ || this.isHovered$) ? 'xl:ml-[290px]' : 'xl:ml-[90px]',
      this.isMobileOpen$ ? 'ml-0' : ''
    ];
  }

}
