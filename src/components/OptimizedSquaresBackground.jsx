import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export const OptimizedSquaresBackground = ({
    direction = 'right',
    speed = 0.3,
    borderColor = 'rgba(91, 154, 139, 0.15)',
    squareSize = 50,
    hoverFillColor = 'rgba(91, 154, 139, 0.1)',
    className = ''
}) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const gridOffset = useRef({ x: 0, y: 0 });
    const hoveredSquare = useRef(null);
    const lastTime = useRef(0);

    // Optimized resize handler with RAF
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        
        requestAnimationFrame(() => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let resizeTimeout;
        let mouseTimeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        resizeCanvas();
        window.addEventListener('resize', handleResize, { passive: true });

        // Optimized drawing with viewport culling
        const drawGrid = () => {
            if (!canvas || !ctx) {
                return;
            }
            
            const rect = canvas.getBoundingClientRect();
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const offsetModX = gridOffset.current.x % squareSize;
            const offsetModY = gridOffset.current.y % squareSize;
            
            const startX = -offsetModX;
            const startY = -offsetModY;
            const endX = rect.width + squareSize;
            const endY = rect.height + squareSize;

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            
            // Use path for better performance
            ctx.beginPath();
            
            for (let x = startX; x < endX; x += squareSize) {
                for (let y = startY; y < endY; y += squareSize) {
                    if (x >= -squareSize && y >= -squareSize && x <= rect.width && y <= rect.height) {
                        // Check for hover state
                        const gridX = Math.floor((x + offsetModX) / squareSize);
                        const gridY = Math.floor((y + offsetModY) / squareSize);
                        
                        if (hoveredSquare.current && 
                            hoveredSquare.current.x === gridX && 
                            hoveredSquare.current.y === gridY) {
                            ctx.fillStyle = hoverFillColor;
                            ctx.fillRect(x, y, squareSize, squareSize);
                        }
                        
                        ctx.rect(x, y, squareSize, squareSize);
                    }
                }
            }
            
            ctx.stroke();
            
            // Subtle gradient overlay
            const gradient = ctx.createRadialGradient(
                rect.width / 2, rect.height / 2, 0,
                rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) / 3
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, rect.width, rect.height);
        };

        // Frame-limited animation with early exit
        const updateAnimation = (currentTime) => {
            // Limit to 60fps max
            if (currentTime - lastTime.current < 16.67) {
                requestRef.current = requestAnimationFrame(updateAnimation);
                return;
            }
            lastTime.current = currentTime;
            
            const effectiveSpeed = Math.max(speed, 0.1);
            
            switch (direction) {
                case 'right':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'left':
                    gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'up':
                    gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'down':
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'diagonal':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                default:
                    break;
            }

            drawGrid();
            requestRef.current = requestAnimationFrame(updateAnimation);
        };

        // Throttled mouse interaction
        const handleMouseMove = (event) => {
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                const gridX = Math.floor((mouseX + gridOffset.current.x) / squareSize);
                const gridY = Math.floor((mouseY + gridOffset.current.y) / squareSize);

                if (!hoveredSquare.current || 
                    hoveredSquare.current.x !== gridX || 
                    hoveredSquare.current.y !== gridY) {
                    hoveredSquare.current = { x: gridX, y: gridY };
                }
            }, 32); // ~30fps for mouse interactions
        };

        const handleMouseLeave = () => {
            hoveredSquare.current = null;
        };

        canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

        requestRef.current = requestAnimationFrame(updateAnimation);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            clearTimeout(resizeTimeout);
            clearTimeout(mouseTimeout);
        };
    }, [direction, speed, borderColor, squareSize, hoverFillColor, resizeCanvas]);

    return (
        <canvas
            ref={canvasRef}
            className={`optimized-squares-background ${className}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 0,
                willChange: 'transform'
            }}
        />
    );
};

OptimizedSquaresBackground.propTypes = {
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'diagonal']),
    speed: PropTypes.number,
    borderColor: PropTypes.string,
    squareSize: PropTypes.number,
    hoverFillColor: PropTypes.string,
    className: PropTypes.string
};
