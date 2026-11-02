import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { CountryCode, PhoneInputComponent } from '../group-input/phone-input/phone-input.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { LabelComponent } from '../label/label.component';
import { CheckboxComponent } from '../input/checkbox.component';
import { FileInputComponent } from '../input/file-input.component';
import { InputFieldComponent } from '../input/input-field.component';
import { RadioComponent } from '../input/radio.component';
import { RadioSmComponent } from '../input/radio-sm.component';
import { SwitchComponent } from '../input/switch.component';
import { TextAreaComponent } from '../input/text-area.component';
import { MultiSelectComponent, Option as MultiSelectOption } from '../multi-select/multi-select.component';
import { SelectComponent, Option as SelectOption } from '../select/select.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { DropzoneComponent } from '../form-elements/dropzone/dropzone.component';

export type DynamicFormFieldType =
    | 'text'
    | 'email'
    | 'number'
    | 'autocomplete'
    | 'password'
    | 'tel'
    | 'url'
    | 'select'
    | 'date'
    | 'time'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'radio-sm'
    | 'switch'
    | 'file'
    | 'multi-select'
    | 'phone'
    | 'dropzone';

export interface DynamicFormOption {
    value: string;
    label: string;
    text?: string;
}

export interface DynamicFormField {
    name: string;
    type: DynamicFormFieldType;
    label: string;
    value?: unknown;
    placeholder?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    min?: string;
    max?: string;
    step?: number;
    colSpan?: 1 | 2;
    options?: DynamicFormOption[];
    countries?: CountryCode[];
}

@Component({
    selector: 'app-dynamic-form',
    standalone: true,
    imports: [
        CommonModule,
        LabelComponent,
        InputFieldComponent,
        SelectComponent,
        DatePickerComponent,
        TimePickerComponent,
        TextAreaComponent,
        CheckboxComponent,
        RadioComponent,
        RadioSmComponent,
        SwitchComponent,
        FileInputComponent,
        MultiSelectComponent,
        PhoneInputComponent,
        DropzoneComponent,
    ],
    template: `
        <form
                [ngClass]="columns === 2 ? 'grid grid-cols-1 gap-5 md:grid-cols-2' : 'space-y-5'"
                novalidate
                (submit)="handleFormSubmit($event)"
        >
      @for (field of fields; track field.name) {
          <div
                  class="space-y-2"
                  [ngClass]="columns === 2 && field.colSpan === 2 ? 'md:col-span-2' : ''"
          >
          @if (showExternalLabel(field)) {
            <app-label [for]="field.name">
              {{ field.label }}
              @if (field.required) {
                <span class="text-error-500">*</span>
              }
            </app-label>
          }

          @if (isInputType(field.type)) {
            <app-input-field
              [id]="field.name"
              [name]="field.name"
              [type]="field.type"
              [value]="inputValue(field.name)"
              [placeholder]="field.placeholder ?? ''"
              [min]="field.min"
              [max]="field.max"
              [step]="field.step"
              [disabled]="field.disabled ?? false"
              [error]="hasError(field.name)"
              [hint]="field.hint"
              (valueChange)="setValue(field.name, $event)"
            />
          } @else {
            @switch (field.type) {
              @case ('select') {
                <app-select
                  [options]="selectOptions(field)"
                  [value]="stringValue(field.name)"
                  [placeholder]="field.placeholder ?? 'Select an option'"
                  (valueChange)="setValue(field.name, $event)"
                />
              }

              @case ('date') {
                <app-date-picker
                  [id]="field.name"
                  [placeholder]="field.placeholder ?? 'Select a date'"
                  [defaultDate]="dateValue(field.name)"
                  (dateChange)="handleDateChange(field.name, $event)"
                />
              }
                @case ('autocomplete') {
                    <div
                            class="relative"
                            role="combobox"
                            [attr.aria-expanded]="isAutocompleteOpen(field.name)"
                            [attr.aria-controls]="field.name + '-suggestions'"
                            (focusout)="handleAutocompleteFocusOut(field.name, $event)"
                    >
                        <app-input-field
                                [id]="field.name"
                                [name]="field.name"
                                [value]="autocompleteDisplayValue(field)"
                                [placeholder]="field.placeholder ?? 'Start typing to search'"
                                [disabled]="field.disabled ?? false"
                                [error]="hasError(field.name)"
                                [hint]="field.hint"
                                (valueChange)="onAutocompleteInput(field, $event)"
                        />

                        @if (isAutocompleteOpen(field.name)) {
                            <ul
                                    [id]="field.name + '-suggestions'"
                                    role="listbox"
                                    class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
                            >
                                @for (option of autocompleteOptions(field); track option.value) {
                                    <li role="option" [attr.aria-selected]="values[field.name] === option.value">
                                        <button
                                                type="button"
                                                class="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden dark:text-gray-300 dark:hover:bg-white/5 dark:focus:bg-white/5"
                                                (click)="selectAutocompleteOption(field, option)"
                                        >
                                            {{ option.label }}
                                        </button>
                                    </li>
                                } @empty {
                                    <li class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        No matching options
                                    </li>
                                }
                            </ul>
                        }
                    </div>
                }  
              @case ('time') {
                <app-time-picker
                  [id]="field.name"
                  [label]="field.label"
                  [placeholder]="field.placeholder ?? 'Select time'"
                  [defaultTime]="dateValue(field.name)"
                  (timeChange)="setValue(field.name, $event)"
                />
              }

              @case ('textarea') {
                <app-text-area
                  [value]="stringValue(field.name)"
                  [placeholder]="field.placeholder ?? ''"
                  [rows]="field.rows ?? 3"
                  [disabled]="field.disabled ?? false"
                  [error]="hasError(field.name)"
                  [hint]="field.hint ?? ''"
                  (valueChange)="setValue(field.name, $event)"
                />
              }

              @case ('checkbox') {
                <app-checkbox
                  [id]="field.name"
                  [label]="field.label"
                  [checked]="booleanValue(field.name)"
                  [disabled]="field.disabled ?? false"
                  (checkedChange)="setValue(field.name, $event)"
                />
              }

              @case ('radio') {
                <div class="flex flex-wrap gap-4">
                  @for (option of field.options ?? []; track option.value) {
                    <app-radio
                      [id]="radioId(field.name, option.value)"
                      [name]="field.name"
                      [value]="option.value"
                      [label]="option.label"
                      [checked]="stringValue(field.name) === option.value"
                      [disabled]="field.disabled ?? false"
                      (valueChange)="setValue(field.name, $event)"
                    />
                  }
                </div>
              }

              @case ('radio-sm') {
                <div class="flex flex-wrap gap-4">
                  @for (option of field.options ?? []; track option.value) {
                    <app-radio-sm
                      [id]="radioId(field.name, option.value)"
                      [name]="field.name"
                      [value]="option.value"
                      [label]="option.label"
                      [checked]="stringValue(field.name) === option.value"
                      (valueChange)="setValue(field.name, $event)"
                    />
                  }
                </div>
              }

              @case ('switch') {
                <app-switch
                  [label]="field.label"
                  [defaultChecked]="booleanValue(field.name)"
                  [disabled]="field.disabled ?? false"
                  (valueChange)="setValue(field.name, $event)"
                />
              }

              @case ('file') {
                <app-file-input (change)="handleFileChange(field.name, $event)" />
              }

              @case ('multi-select') {
                <app-multi-select
                  [options]="multiSelectOptions(field)"
                  [defaultSelected]="stringArrayValue(field.name)"
                  [disabled]="field.disabled ?? false"
                  (selectionChange)="setValue(field.name, $event)"
                />
              }

              @case ('phone') {
                <app-phone-input
                  [countries]="field.countries ?? []"
                  [placeholder]="field.placeholder ?? 'Enter phone number'"
                  (phoneChange)="setValue(field.name, $event)"
                />
              }

              @case ('dropzone') {
                <app-dropzone (filesDropped)="setValue(field.name, $event)" />
              }
            }
          }

          @if (hasError(field.name)) {
            <p class="text-sm text-error-500">{{ errors[field.name] }}</p>
          }
        </div>
      }

     @if (showSubmitButton || showCancelButton) {
         <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end" [ngClass]="columns === 2 ? 'md:col-span-2' : ''">
             @if (showCancelButton) {
                 <button
                         type="button"
                         class="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                         (click)="cancelForm()"
                 >
                     {{ cancelLabel }}
                 </button>
             }

             @if (showSubmitButton) {
                 <button
                         type="submit"
                         class="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
                 >
                     {{ submitLabel }}
                 </button>
             }
         </div>
     }
   </form>
  `,
})
export class DynamicFormComponent implements OnChanges {
    @Input() fields: DynamicFormField[] = [];
    @Input() showSubmitButton = true;
    @Input() submitLabel = 'Submit';
    @Input() showCancelButton = false;
    @Input() cancelLabel = 'Cancel';
    @Input() columns: 1 | 2 = 1;
    @Output() valueChange = new EventEmitter<Record<string, unknown>>();
    @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
    @Output() formCancel = new EventEmitter<void>();

    private autocompleteQueries: Record<string, string> = {};
    private autocompleteOpen: Record<string, boolean> = {};
    private autocompleteSelected: Record<string, boolean> = {};

    values: Record<string, unknown> = {};
    errors: Record<string, string> = {};

    ngOnChanges(): void {
        this.values = Object.fromEntries(
            this.fields.map(field => [field.name, field.value ?? this.defaultValue(field.type)]),
        );
        this.errors = {};
    }

    isInputType(type: DynamicFormFieldType): boolean {
        return ['text', 'email', 'number', 'password', 'tel', 'url'].includes(type);
    }

    showExternalLabel(field: DynamicFormField): boolean {
        return !['checkbox', 'switch', 'time'].includes(field.type);
    }

    inputValue(name: string): string | number {
        const value = this.values[name];
        return typeof value === 'string' || typeof value === 'number' ? value : '';
    }

    stringValue(name: string): string {
        const value = this.values[name];
        return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    }

    booleanValue(name: string): boolean {
        return this.values[name] === true;
    }

    stringArrayValue(name: string): string[] {
        const value = this.values[name];
        return Array.isArray(value) && value.every(item => typeof item === 'string')
            ? value
            : [];
    }

    dateValue(name: string): string | Date | undefined {
        const value = this.values[name];
        return typeof value === 'string' || value instanceof Date ? value : undefined;
    }

    selectOptions(field: DynamicFormField): SelectOption[] {
        return (field.options ?? []).map(option => ({
            value: option.value,
            label: option.label,
        }));
    }

    multiSelectOptions(field: DynamicFormField): MultiSelectOption[] {
        return (field.options ?? []).map(option => ({
            value: option.value,
            text: option.text ?? option.label,
        }));
    }

    radioId(name: string, value: string): string {
        return `${name}-${value}`;
    }

    hasError(name: string): boolean {
        return Boolean(this.errors[name]);
    }

    setValue(name: string, value: unknown): void {
        this.values = { ...this.values, [name]: value };

        const field = this.fields.find(item => item.name === name);
        if (field?.required && this.isEmpty(value)) {
            this.errors = { ...this.errors, [name]: `${field.label} is required.` };
        } else if (this.errors[name]) {
            const { [name]: removed, ...remainingErrors } = this.errors;
            this.errors = remainingErrors;
        }

        this.valueChange.emit({ ...this.values });
    }

    handleDateChange(name: string, event: { dateStr: string }): void {
        this.setValue(name, event.dateStr);
    }

    handleFileChange(name: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        this.setValue(name, Array.from(input.files ?? []));
    }

    handleFormSubmit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.submitForm();
    }

    cancelForm(): void {
        this.formCancel.emit();
    }

    submitForm(): void {
        const errors: Record<string, string> = {};

        for (const field of this.fields) {
            if (field.required && this.isEmpty(this.values[field.name])) {
                errors[field.name] = `${field.label} is required.`;
            }
        }

        this.errors = errors;

        if (Object.keys(errors).length === 0) {
            this.formSubmit.emit({ ...this.values });
        }
    }

    private isEmpty(value: unknown): boolean {
        return (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
        );
    }

    private defaultValue(type: DynamicFormFieldType): unknown {
        if (type === 'checkbox' || type === 'switch') return false;
        if (type === 'multi-select' || type === 'file' || type === 'dropzone') return [];
        return '';
    }
    isAutocompleteOpen(name: string): boolean {
        return this.autocompleteOpen[name] ?? false;
    }

    autocompleteDisplayValue(field: DynamicFormField): string {
        const query = this.autocompleteQueries[field.name];
        if (query !== undefined) return query;

        const value = this.values[field.name];
        const selected = field.options?.find(option => option.value === value);
        return selected?.label ?? this.stringValue(field.name);
    }

    autocompleteOptions(field: DynamicFormField): DynamicFormOption[] {
        const query = (this.autocompleteQueries[field.name] ?? '').trim().toLowerCase();

        return (field.options ?? [])
            .filter(option =>
                `${option.label} ${option.value}`.toLowerCase().includes(query)
            )
            .slice(0, 8);
    }

    onAutocompleteInput(
        field: DynamicFormField,
        value: string | number,
    ): void {
        const query = String(value);
        this.autocompleteQueries = { ...this.autocompleteQueries, [field.name]: query };
        this.autocompleteOpen = { ...this.autocompleteOpen, [field.name]: true };
        this.autocompleteSelected = { ...this.autocompleteSelected, [field.name]: false };
        this.setValue(field.name, query);
    }

    selectAutocompleteOption(field: DynamicFormField, option: DynamicFormOption): void {
        this.autocompleteQueries = {
            ...this.autocompleteQueries,
            [field.name]: option.label,
        };
        this.autocompleteOpen = { ...this.autocompleteOpen, [field.name]: false };
        this.autocompleteSelected = { ...this.autocompleteSelected, [field.name]: true };
        this.setValue(field.name, option.value);
    }

    handleAutocompleteFocusOut(name: string, event: FocusEvent): void {
        const root = event.currentTarget;
        const nextTarget = event.relatedTarget;

        if (root instanceof HTMLElement && nextTarget instanceof Node && root.contains(nextTarget)) {
            return;
        }

        this.autocompleteOpen = { ...this.autocompleteOpen, [name]: false };
    }
}