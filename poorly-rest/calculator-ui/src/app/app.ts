import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { load } from 'js-yaml';

type OperationId = 'add' | 'subtract' | 'multiply' | 'divide' | 'modulus';
type BackendId = 'express' | 'flask' | 'spring';

interface OpenApiPath {
  get?: {
    operationId?: string;
  };
}

interface OpenApiServer {
  url?: string;
  description?: string;
}

interface OpenApiSpec {
  servers?: OpenApiServer[];
  paths?: Record<string, OpenApiPath>;
}

interface BackendConfig {
  id: BackendId;
  label: string;
  serverUrl: string;
  apiBase: string;
  themeClass: string;
}

interface OperationMap {
  add: string;
  subtract: string;
  multiply: string;
  divide: string;
  modulus: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly display = signal('0');
  protected readonly expression = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isBusy = signal(false);
  protected readonly selectedBackendId = signal<BackendId>('express');
  protected readonly backends = signal<BackendConfig[]>([]);

  protected readonly selectedBackend = computed(() => {
    const current = this.backends().find((backend) => backend.id === this.selectedBackendId());
    return current ?? this.fallbackBackends()[0];
  });

  protected readonly themeClass = computed(() => this.selectedBackend().themeClass);

  private operationPaths: OperationMap = {
    add: '/operations/add',
    subtract: '/operations/subtract',
    multiply: '/operations/multiply',
    divide: '/operations/divide',
    modulus: '/operations/modulus'
  };

  private pendingOperation: OperationId | null = null;
  private storedValue: number | null = null;
  private shouldReplaceDisplay = true;

  constructor(private readonly http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    await this.loadContract();
  }

  protected selectBackend(id: BackendId): void {
    this.selectedBackendId.set(id);
    this.errorMessage.set('');
  }

  protected clear(): void {
    this.display.set('0');
    this.expression.set('');
    this.errorMessage.set('');
    this.pendingOperation = null;
    this.storedValue = null;
    this.shouldReplaceDisplay = true;
  }

  protected toggleSign(): void {
    if (this.display() === '0') {
      return;
    }

    const value = -this.parseDisplay();
    this.display.set(this.formatNumber(value));
  }

  protected inputDigit(digit: string): void {
    if (this.shouldReplaceDisplay || this.display() === '0') {
      this.display.set(digit);
      this.shouldReplaceDisplay = false;
      return;
    }

    this.display.set(`${this.display()}${digit}`);
  }

  protected inputDecimal(): void {
    if (this.shouldReplaceDisplay) {
      this.display.set('0.');
      this.shouldReplaceDisplay = false;
      return;
    }

    if (!this.display().includes('.')) {
      this.display.set(`${this.display()}.`);
    }
  }

  protected setOperation(operation: OperationId): void {
    void this.applyOperation(operation);
  }

  protected computeResult(): void {
    void this.resolvePendingOperation();
  }

  private async loadContract(): Promise<void> {
    try {
      const yamlText = await firstValueFrom(this.http.get('/openapi.yaml', { responseType: 'text' }));
      const spec = load(yamlText) as OpenApiSpec;
      this.operationPaths = this.parseOperationPaths(spec);
      this.backends.set(this.parseBackends(spec.servers));
    } catch {
      this.backends.set(this.fallbackBackends());
      this.errorMessage.set('Could not read openapi.yaml. Using safe endpoint defaults.');
    }
  }

  private parseOperationPaths(spec: OpenApiSpec): OperationMap {
    const parsed: Partial<OperationMap> = {};

    for (const [path, item] of Object.entries(spec.paths ?? {})) {
      const operationId = item.get?.operationId as OperationId | undefined;
      if (operationId && this.isOperationId(operationId)) {
        parsed[operationId] = path;
      }
    }

    return {
      add: parsed.add ?? '/operations/add',
      subtract: parsed.subtract ?? '/operations/subtract',
      multiply: parsed.multiply ?? '/operations/multiply',
      divide: parsed.divide ?? '/operations/divide',
      modulus: parsed.modulus ?? '/operations/modulus'
    };
  }

  private parseBackends(servers: OpenApiServer[] | undefined): BackendConfig[] {
    const defaults = this.fallbackBackends();
    const serverPool = Array.isArray(servers) ? [...servers] : [];

    return defaults.map((candidate) => {
      const keywords = this.backendKeywords(candidate.id);
      const matchIndex = serverPool.findIndex((server) => {
        const description = typeof server.description === 'string' ? server.description.toLowerCase() : '';
        return keywords.some((keyword) => description.includes(keyword));
      });

      const match = matchIndex >= 0 ? serverPool.splice(matchIndex, 1)[0] : undefined;
      return {
        ...candidate,
        label: match?.description?.trim() || candidate.label,
        serverUrl: match?.url || candidate.serverUrl
      };
    });
  }

  protected backendDisplayName(backend: BackendConfig): string {
    return backend.label || this.backendKeywords(backend.id)[0];
  }

  protected backendPort(serverUrl: string): string {
    try {
      const parsed = new URL(serverUrl);
      if (parsed.port) {
        return parsed.port;
      }

      if (parsed.protocol === 'http:') {
        return '80';
      }

      if (parsed.protocol === 'https:') {
        return '443';
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private backendKeywords(id: BackendId): string[] {
    if (id === 'express') {
      return ['express', 'typescript'];
    }

    if (id === 'flask') {
      return ['flask', 'python'];
    }

    return ['spring', 'java'];
  }

  private fallbackBackends(): BackendConfig[] {
    return [
      {
        id: 'express',
        label: 'ExpressJS',
        serverUrl: 'http://localhost:3066',
        apiBase: '/api/express',
        themeClass: 'theme-express'
      },
      {
        id: 'flask',
        label: 'Flask',
        serverUrl: 'http://localhost:8082',
        apiBase: '/api/flask',
        themeClass: 'theme-flask'
      },
      {
        id: 'spring',
        label: 'Spring Boot',
        serverUrl: 'http://localhost:8083',
        apiBase: '/api/spring',
        themeClass: 'theme-spring'
      }
    ];
  }

  private isOperationId(value: string): value is OperationId {
    return value === 'add' || value === 'subtract' || value === 'multiply' || value === 'divide' || value === 'modulus';
  }

  private parseDisplay(): number {
    return Number.parseFloat(this.display());
  }

  private formatNumber(value: number): string {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return Number(value.toFixed(10)).toString();
  }

  private symbolFor(operation: OperationId): string {
    switch (operation) {
      case 'add':
        return '+';
      case 'subtract':
        return '-';
      case 'multiply':
        return 'x';
      case 'divide':
        return '÷';
      case 'modulus':
        return '%';
    }
  }

  private async applyOperation(operation: OperationId): Promise<void> {
    if (this.isBusy()) {
      return;
    }

    const current = this.parseDisplay();

    if (this.pendingOperation === null) {
      this.storedValue = current;
    } else if (!this.shouldReplaceDisplay && this.storedValue !== null) {
      const chainedResult = await this.execute(this.pendingOperation, this.storedValue, current);
      if (chainedResult === null) {
        return;
      }
      this.storedValue = chainedResult;
      this.display.set(this.formatNumber(chainedResult));
    }

    this.pendingOperation = operation;
    this.shouldReplaceDisplay = true;
    if (this.storedValue !== null) {
      this.expression.set(`${this.formatNumber(this.storedValue)} ${this.symbolFor(operation)}`);
    }
  }

  private async resolvePendingOperation(): Promise<void> {
    if (this.pendingOperation === null || this.storedValue === null || this.isBusy()) {
      return;
    }

    const rightSide = this.parseDisplay();
    const op = this.pendingOperation;
    const leftSide = this.storedValue;

    this.expression.set(`${this.formatNumber(leftSide)} ${this.symbolFor(op)} ${this.formatNumber(rightSide)}`);

    const result = await this.execute(op, leftSide, rightSide);
    if (result === null) {
      return;
    }

    this.display.set(this.formatNumber(result));
    this.pendingOperation = null;
    this.storedValue = null;
    this.shouldReplaceDisplay = true;
  }

  private async execute(operation: OperationId, a: number, b: number): Promise<number | null> {
    this.errorMessage.set('');
    this.isBusy.set(true);

    try {
      const endpoint = this.operationPaths[operation];
      const url = `${this.selectedBackend().apiBase}${endpoint}`;
      const response = await firstValueFrom(
        this.http.get<{ result: number }>(url, {
          params: {
            a: a.toString(),
            b: b.toString()
          }
        })
      );

      if (typeof response.result !== 'number' || Number.isNaN(response.result)) {
        throw new Error('Invalid response payload from calculator API.');
      }

      return response.result;
    } catch {
      this.errorMessage.set('Operation failed. Check backend status or input values.');
      return null;
    } finally {
      this.isBusy.set(false);
    }
  }
}
