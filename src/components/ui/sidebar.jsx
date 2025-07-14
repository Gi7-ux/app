import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils.js';

// Context for sidebar state
const SidebarContext = createContext(null);

export const SidebarProvider = ({ children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  const value = {
    open,
    setOpen,
    toggleSidebar: () => setOpen(!open),
  };

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const Sidebar = React.forwardRef(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-64 flex-col border-r bg-sidebar transition-all duration-300',
        !open && 'w-16',
        className
      )}
      {...props}
    />
  );
});

Sidebar.displayName = 'Sidebar';
Sidebar.propTypes = {
  className: PropTypes.string,
};

export const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-1 flex-col gap-2 p-4', className)}
    {...props}
  />
));

SidebarContent.displayName = 'SidebarContent';
SidebarContent.propTypes = {
  className: PropTypes.string,
};

export const SidebarInset = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-1 flex-col', className)}
    {...props}
  />
));

SidebarInset.displayName = 'SidebarInset';
SidebarInset.propTypes = {
  className: PropTypes.string,
};

export const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2 p-4 border-b', className)}
    {...props}
  />
));

SidebarHeader.displayName = 'SidebarHeader';
SidebarHeader.propTypes = {
  className: PropTypes.string,
};

export const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-col gap-1', className)}
    {...props}
  />
));

SidebarMenu.displayName = 'SidebarMenu';
SidebarMenu.propTypes = {
  className: PropTypes.string,
};

export const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('list-none', className)}
    {...props}
  />
));

SidebarMenuItem.displayName = 'SidebarMenuItem';
SidebarMenuItem.propTypes = {
  className: PropTypes.string,
};

export const SidebarMenuButton = React.forwardRef(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
      className
    )}
    {...props}
  />
));

SidebarMenuButton.displayName = 'SidebarMenuButton';
SidebarMenuButton.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
};