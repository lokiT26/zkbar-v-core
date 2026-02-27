import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../src/App';

describe('Frontend App Base Component', () => {
    // Cleanup the DOM after each test to prevent multiple renders from colliding
    afterEach(() => {
        cleanup();
    });
    it('Should render the Navigation Bar with branding', () => {
        render(<App />);
        expect(screen.getByText('ZKBAR-V')).toBeTruthy();
    });

    it('Should contain Issue and Verify navigation links', () => {
        render(<App />);
        expect(screen.getAllByText(/Issue Credential/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Verify Credential/i).length).toBeGreaterThan(0);
    });

    it('Should render the main background animated blobs', () => {
        const { container } = render(<App />);
        // Use querySelector to check if the blobs are in the DOM
        expect(container.querySelector('.bg-blob.blob-1')).toBeTruthy();
        expect(container.querySelector('.bg-blob.blob-2')).toBeTruthy();
    });
});
