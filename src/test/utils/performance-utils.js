import { performance } from 'perf_hooks';
import { vi } from 'vitest';

/**
 * Performance testing utilities
 */

export const measureRenderTime = async (renderFn) => {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    return end - start;
};

export const measureApiCallTime = async (apiFn) => {
    const start = performance.now();
    await apiFn();
    const end = performance.now();
    return end - start;
};

/**
 * Memory usage utilities
 */
export const measureMemoryUsage = (testFn) => {
    const startMemory = process.memoryUsage();
    testFn();
    const endMemory = process.memoryUsage();

    return {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external
    };
};

/**
 * Accessibility testing utilities
 */
export const checkAccessibility = (container) => {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const results = {
        focusableElementsCount: focusableElements.length,
        elementsWithoutAriaLabels: [],
        elementsWithoutProperRoles: []
    };

    focusableElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            results.elementsWithoutAriaLabels.push(element.tagName);
        }

        if (element.tagName === 'BUTTON' && !element.getAttribute('role')) {
            results.elementsWithoutProperRoles.push(element.tagName);
        }
    });

    return results;
};

/**
 * Load testing utilities
 */
export const simulateHighLoad = async (component, iterations = 100) => {
    const renderTimes = [];

    for (let i = 0; i < iterations; i++) {
        const time = await measureRenderTime(() => component());
        renderTimes.push(time);
    }

    return {
        average: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes),
        p95: renderTimes.sort((a, b) => a - b)[Math.floor(renderTimes.length * 0.95)]
    };
};

/**
 * Network simulation utilities
 */
export const simulateSlowNetwork = (delay = 2000) => {
    const originalFetch = global.fetch;

    global.fetch = vi.fn().mockImplementation(async (...args) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return originalFetch.apply(global, args);
    });

    return () => {
        global.fetch = originalFetch;
    };
};

export const simulateNetworkFailure = (failureRate = 0.5) => {
    const originalFetch = global.fetch;

    global.fetch = vi.fn().mockImplementation((...args) => {
        if (Math.random() < failureRate) {
            return Promise.reject(new Error('Network failure'));
        }
        return originalFetch.apply(global, args);
    });

    return () => {
        global.fetch = originalFetch;
    };
};

/**
 * User interaction simulation
 */
export const simulateUserFlow = async (steps) => {
    const results = [];

    for (const step of steps) {
        const start = performance.now();
        await step.action();
        const end = performance.now();

        results.push({
            name: step.name,
            duration: end - start,
            success: step.assertion ? await step.assertion() : true
        });
    }

    return results;
};

/**
 * Data generation utilities
 */
export const generateLargeDataset = (size, generator) => {
    return Array.from({ length: size }, (_, index) => generator(index));
};

export const generateMockProjects = (count) => {
    return generateLargeDataset(count, (index) => ({
        id: index + 1,
        title: `Project ${index + 1}`,
        description: `Description for project ${index + 1}`,
        status: ['active', 'completed', 'pending'][index % 3],
        budget: Math.floor(Math.random() * 50000) + 1000,
        deadline: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
};

export const generateMockUsers = (count) => {
    return generateLargeDataset(count, (index) => ({
        id: index + 1,
        username: `user${index + 1}`,
        email: `user${index + 1}@example.com`,
        role: ['admin', 'client', 'freelancer'][index % 3],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
};
