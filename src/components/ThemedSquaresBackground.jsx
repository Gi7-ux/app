import React from 'react';
import PropTypes from 'prop-types';
import { SquaresBackground } from './SquaresBackground.jsx';

export const ThemedSquaresBackground = ({ userRole, className = '' }) => {
    // Get theme colors based on user role
    const getThemeColors = (role) => {
        const rootStyles = getComputedStyle(document.documentElement);
        const primaryColor = rootStyles.getPropertyValue('--primary-color').trim() || '#5B9A8B';

        // Convert hex to rgba for better blending
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        switch (role) {
            case 'admin':
                return {
                    borderColor: hexToRgba(primaryColor, 0.15),
                    hoverFillColor: hexToRgba(primaryColor, 0.1),
                    direction: 'diagonal',
                    speed: 0.3
                };
            case 'client':
                return {
                    borderColor: hexToRgba('#3B82F6', 0.15), // Blue for clients
                    hoverFillColor: hexToRgba('#3B82F6', 0.1),
                    direction: 'right',
                    speed: 0.4
                };
            case 'freelancer':
                return {
                    borderColor: hexToRgba('#10B981', 0.15), // Green for freelancers
                    hoverFillColor: hexToRgba('#10B981', 0.1),
                    direction: 'left',
                    speed: 0.5
                };
            default:
                return {
                    borderColor: hexToRgba(primaryColor, 0.15),
                    hoverFillColor: hexToRgba(primaryColor, 0.1),
                    direction: 'diagonal',
                    speed: 0.3
                };
        }
    };

    const themeColors = getThemeColors(userRole);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        }}>
            <SquaresBackground
                direction={themeColors.direction}
                speed={themeColors.speed}
                borderColor={themeColors.borderColor}
                squareSize={50}
                hoverFillColor={themeColors.hoverFillColor}
                className={className}
            />
        </div>
    );
};

ThemedSquaresBackground.propTypes = {
    userRole: PropTypes.string,
    className: PropTypes.string
};

export default ThemedSquaresBackground;
