// import '@testing-library/jest-dom'; // vitest >=0.25.x automatically extends expect with jest-dom matchers if @testing-library/jest-dom is installed
// For older versions or explicit control, uncomment the line above.
// Or, if using Vitest's own extended matchers:
import '@testing-library/jest-dom/vitest'; // Explicitly extend expect for Vitest
import { vi } from 'vitest';

// Example: Mock global objects or functions if needed for all tests
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: vi.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: vi.fn(), // deprecated
//     removeListener: vi.fn(), // deprecated
//     addEventListener: vi.fn(),
//     removeEventListener: vi.fn(),
//     dispatchEvent: vi.fn(),
//   })),
// });

// You can add other global setup here, like cleaning up after each test if not handled by Vitest/Testing Library defaults.
// For example, React Testing Library typically handles cleanup automatically.
