import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerPortal = DialogPrimitive.Portal;

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[#162B22]/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: 'right' | 'left';
  }
>(({ className, side = 'right', children, ...props }, ref) => {
  const sideClasses = {
    right: 'inset-y-0 right-0 h-full w-full max-w-md border-l border-outline-variant/40 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    left: 'inset-y-0 left-0 h-full w-full max-w-md border-r border-outline-variant/40 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        dir="rtl"
        className={cn(
          'fixed z-50 bg-surface-container-lowest p-6 shadow-modal duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out overflow-y-auto text-right flex flex-col justify-between',
          sideClasses[side],
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full">{children}</div>
        <DialogPrimitive.Close className="absolute left-4 top-4 rounded-lg p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
          <span className="sr-only">إغلاق</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = DialogPrimitive.Content.displayName;

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-right mb-4 pb-3 border-b border-outline-variant/30', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-bold text-on-surface', className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-xs text-on-surface-variant', className)}
    {...props}
  />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30 mt-auto', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';
