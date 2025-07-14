import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export const SquaresBackground = ({
    direction = 'diagonal',
    speed = 0.3,
    borderColor = 'rgba(91, 154, 139, 0.15)',
    squareSize = 50,
    hoverFillColor = 'rgba(91, 154, 139, 0.1)',
    className = ''
}) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const hoveredSquare = useRef(null);
    const startTime = useRef(Date.now());
    const lastResize = useRef(0);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const now = Date.now();
        if (now - lastResize.current < 100) {
            return; // Throttle resize
        }
        lastResize.current = now;

        const parent = canvas.parentElement;
        if (!parent) {
            return;
        }

        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limit DPR for performance

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        let isAnimating = true;

        resizeCanvas();

        // Throttled resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isAnimating) resizeCanvas();
            }, 150);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        // Throttled mouse handlers with better performance
        let mousePos = { x: -1, y: -1 };
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mousePos.x = e.clientX - rect.left;
            mousePos.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            hoveredSquare.current = null;
            mousePos.x = -1;
            mousePos.y = -1;
        };

        canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

        // Optimized animation loop with frame skipping
        let lastFrameTime = 0;
        const updateAnimation = (currentTime) => {
            if (!isAnimating) return;

            // Skip frames if needed (30fps target for better performance)
            if (currentTime - lastFrameTime < 33) {
                requestRef.current = requestAnimationFrame(updateAnimation);
                return;
            }
            lastFrameTime = currentTime;

            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                requestRef.current = requestAnimationFrame(updateAnimation);
                return;
            }

            const elapsedTime = (currentTime - startTime.current) * speed * 0.01;

            // Clear canvas efficiently
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Calculate offset based on direction
            let offsetX = 0, offsetY = 0;
            switch (direction) {
                case 'horizontal':
                    offsetX = (elapsedTime % squareSize);
                    break;
                case 'vertical':
                    offsetY = (elapsedTime % squareSize);
                    break;
                case 'diagonal':
                default:
                    offsetX = (elapsedTime % squareSize);
                    offsetY = (elapsedTime % squareSize);
                    break;
            }

            // Calculate hover state efficiently
            let hoveredCol = -1, hoveredRow = -1;
            if (mousePos.x >= 0 && mousePos.y >= 0) {
                hoveredCol = Math.floor((mousePos.x + offsetX) / squareSize);
                hoveredRow = Math.floor((mousePos.y + offsetY) / squareSize);
            }

            // Set drawing styles once
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;

            // Calculate grid bounds more efficiently
            const startCol = Math.floor(-offsetX / squareSize) - 1;
            const endCol = Math.ceil((rect.width - offsetX) / squareSize) + 1;
            const startRow = Math.floor(-offsetY / squareSize) - 1;
            const endRow = Math.ceil((rect.height - offsetY) / squareSize) + 1;

            // Draw grid with path batching for better performance
            ctx.beginPath();

            for (let col = startCol; col < endCol; col++) {
                for (let row = startRow; row < endRow; row++) {
                    const x = col * squareSize - offsetX;
                    const y = row * squareSize - offsetY;

                    // Only process visible squares
                    if (x + squareSize >= 0 && y + squareSize >= 0 &&
                        x <= rect.width && y <= rect.height) {

                        // Fill hovered square
                        if (col === hoveredCol && row === hoveredRow) {
                            ctx.fillStyle = hoverFillColor;
                            ctx.fillRect(x, y, squareSize, squareSize);
                        }

                        // Add to stroke path
                        ctx.rect(x, y, squareSize, squareSize);
                    }
                }
            }

            // Stroke all at once for better performance
            ctx.stroke();

            requestRef.current = requestAnimationFrame(updateAnimation);
        };

        requestRef.current = requestAnimationFrame(updateAnimation);

        return () => {
            isAnimating = false;
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            clearTimeout(resizeTimeout);
        };
    }, [direction, speed, borderColor, squareSize, hoverFillColor, resizeCanvas]);

    return (
        <canvas
            ref={canvasRef}
            className={`squares-canvas ${className}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 1
            }}
        />
    );
};

SquaresBackground.propTypes = {
    direction: PropTypes.oneOf(['diagonal', 'horizontal', 'vertical']),
    speed: PropTypes.number,
    borderColor: PropTypes.string,
    squareSize: PropTypes.number,
    hoverFillColor: PropTypes.string,
    className: PropTypes.string
};

export default SquaresBackground;
