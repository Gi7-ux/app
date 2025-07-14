import React from 'react';
import { LiquidGlassWrapper } from './LiquidGlassWrapper.jsx';
import PropTypes from 'prop-types';

/**
 * Liquid Glass Button Component
 */
export const LiquidGlassButton = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const handleClick = (e) => {
        if (!disabled && onClick) {
            onClick(e);
        }
    };

    const buttonClass = `
    liquid-glass-button 
    ${variant} 
    ${size} 
    ${disabled ? 'disabled' : ''} 
    ${className}
  `.trim();

    return (
        <LiquidGlassWrapper
            variant="button"
            size={size}
            className={buttonClass}
            onClick={handleClick}
            style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                transition: 'all 0.3s ease',
            }}
            {...props}
        >
            <button
                type={type}
                className="glass-button-content"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: 'inherit',
                    fontWeight: '500',
                    cursor: 'inherit',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                disabled={disabled}
            >
                {children}
            </button>
        </LiquidGlassWrapper>
    );
};

LiquidGlassButton.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

/**
 * Liquid Glass Card Component
 */
export const LiquidGlassCard = ({
    children,
    className = '',
    overLight = false,
    style = {},
    ...props
}) => (
    <LiquidGlassWrapper
        variant="card"
        size="custom"
        overLight={overLight}
        className={`liquid-glass-card ${className}`}
        style={{
            width: '100%',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            ...style
        }}
        {...props}
    >
        <div
            className="glass-card-content"
            style={{
                color: 'white',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                width: '100%',
                height: '100%',
            }}
        >
            {children}
        </div>
    </LiquidGlassWrapper>
);

LiquidGlassCard.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    overLight: PropTypes.bool,
    style: PropTypes.object,
};

/**
 * Liquid Glass Navigation Item
 */
export const LiquidGlassNavItem = ({
    children,
    active = false,
    className = '',
    onClick,
    ...props
}) => (
    <LiquidGlassWrapper
        variant="navigation"
        size="medium"
        className={`liquid-glass-nav-item ${active ? 'active' : ''} ${className}`}
        onClick={onClick}
        style={{
            cursor: 'pointer',
            width: '100%',
            opacity: active ? 1 : 0.8,
            transition: 'all 0.3s ease',
        }}
        {...props}
    >
        <div
            className="glass-nav-content"
            style={{
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
            }}
        >
            {children}
        </div>
    </LiquidGlassWrapper>
);

LiquidGlassNavItem.propTypes = {
    children: PropTypes.node.isRequired,
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

/**
 * Liquid Glass Modal/Dialog
 */
export const LiquidGlassModal = ({
    children,
    className = '',
    style = {},
    ...props
}) => (
    <LiquidGlassWrapper
        variant="modal"
        size="custom"
        className={`liquid-glass-modal ${className}`}
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            maxWidth: '90vw',
            maxHeight: '90vh',
            ...style
        }}
        {...props}
    >
        <div
            className="glass-modal-content"
            style={{
                color: 'white',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                overflow: 'auto',
            }}
        >
            {children}
        </div>
    </LiquidGlassWrapper>
);

LiquidGlassModal.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
};

/**
 * Liquid Glass Input Field
 */
export const LiquidGlassInput = ({
    placeholder = '',
    type = 'text',
    value = '',
    onChange,
    className = '',
    style = {},
    ...props
}) => (
    <LiquidGlassWrapper
        variant="secondary"
        size="medium"
        className={`liquid-glass-input ${className}`}
        style={{
            width: '100%',
            ...style
        }}
        {...props}
    >
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="glass-input-field"
            style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '14px',
                width: '100%',
                padding: '0',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                }
            }}
            {...props}
        />
    </LiquidGlassWrapper>
);

LiquidGlassInput.propTypes = {
    placeholder: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
};
