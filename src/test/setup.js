// This file is now unused. Jest setup is handled in jest.setup.js


import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { mockLocalStorage } from './utils/test-utils.jsx';

// Mock OptimizedSquaresBackground to avoid canvas errors in JSDOM
jest.mock('../components/OptimizedSquaresBackground.jsx', () => ({
  OptimizedSquaresBackground: () => React.createElement('div', { 'data-testid': 'mock-optimized-squares-background' })
}));

// extends Jest's expect method with methods from jest-dom
// (already handled by @testing-library/jest-dom import)

// Mock localStorage globally
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock window.alert and window.confirm
Object.defineProperty(window, 'alert', {
  value: jest.fn()
});

Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true)
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
  jest.clearAllMocks();
  mockLocalStorage.clear();
});
