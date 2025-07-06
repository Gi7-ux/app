import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { mockLocalStorage } from './utils/test-utils.jsx';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock localStorage globally
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock window.alert and window.confirm
Object.defineProperty(window, 'alert', {
  value: vi.fn()
});

Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true)
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockLocalStorage.clear();
});
