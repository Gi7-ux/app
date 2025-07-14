import React, { forwardRef, useMemo } from 'react';
import LiquidGlass from 'liquid-glass-react';
import PropTypes from 'prop-types';

/**
 * Theme-aware wrapper for LiquidGlass component
 * Provides consistent styling across the application with optimized performance
 */
export const LiquidGlassWrapper = forwardRef(({
    children,
    variant = 'primary',
    size = 'medium',
    overLight = false,
    className = '',
    style = {},
    onClick,
    ...props
}, ref) => {
    // Memoized variant configurations to prevent recalculation
    const variantConfig = useMemo(() => {
        const variants = {
            primary: {
                displacementScale: 70,
                blurAmount: 0.15,
                saturation: 140,
                aberrationIntensity: 2,
                elasticity: 0.2,
                cornerRadius: 16,
                mode: 'standard',
            },
            secondary: {
                displacementScale: 50,
                blurAmount: 0.1,
                saturation: 120,
                aberrationIntensity: 1.5,
                elasticity: 0.15,
                cornerRadius: 12,
                mode: 'standard',
            },
            card: {
                displacementScale: 40,
                blurAmount: 0.08,
                saturation: 110,
                aberrationIntensity: 1,
                elasticity: 0.1,
                cornerRadius: 12,
                mode: 'polar',
            },
            button: {
                displacementScale: 60,
                blurAmount: 0.12,
                saturation: 130,
                aberrationIntensity: 2,
                elasticity: 0.3,
                cornerRadius: 8,
                mode: 'prominent',
            },
            navigation: {
                displacementScale: 30,
                blurAmount: 0.06,
                saturation: 100,
                aberrationIntensity: 0.5,
                elasticity: 0.05,
                cornerRadius: 8,
                mode: 'standard',
            },
            modal: {
                displacementScale: 80,
                blurAmount: 0.2,
                saturation: 150,
                aberrationIntensity: 2.5,
                elasticity: 0.25,
                cornerRadius: 20,
                mode: 'standard', // Changed from 'shader' for better performance
            }
        };
        return variants[variant] || variants.primary;
    }, [variant]);

    // Memoized size configurations
    const sizeConfig = useMemo(() => {
        const sizes = {
            small: { padding: '8px 12px' },
            medium: { padding: '12px 16px' },
            large: { padding: '16px 24px' },
            xlarge: { padding: '24px 32px' },
            custom: { padding: '0' }
        };
        return sizes[size] || sizes.medium;
    }, [size]);

    // Memoized style object to prevent re-renders
    const combinedStyle = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform', // Optimize for animations
        ...style
    }), [style]);

    const glassPadding = style.padding || sizeConfig.padding;

    return (
        <LiquidGlass
            ref={ref}
            displacementScale={variantConfig.displacementScale}
            blurAmount={variantConfig.blurAmount}
            saturation={variantConfig.saturation}
            aberrationIntensity={variantConfig.aberrationIntensity}
            elasticity={variantConfig.elasticity}
            cornerRadius={variantConfig.cornerRadius}
            mode={variantConfig.mode}
            padding={glassPadding}
            overLight={overLight}
            className={`liquid-glass-wrapper ${variant} ${className}`}
            style={combinedStyle}
            onClick={onClick}
            {...props}
        >
            {children}
        </LiquidGlass>
    );
});

LiquidGlassWrapper.displayName = 'LiquidGlassWrapper';

LiquidGlassWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'card', 'button', 'navigation', 'modal']),
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge', 'custom']),
    overLight: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
};

export default LiquidGlassWrapper;
