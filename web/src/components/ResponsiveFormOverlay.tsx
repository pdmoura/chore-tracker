import { useEffect, useRef, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface ResponsiveFormOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isBusy: boolean;
  children: ReactNode;
  footer: ReactNode;
}

export function ResponsiveFormOverlay({
  open,
  onOpenChange,
  title,
  description,
  isBusy,
  children,
  footer,
}: ResponsiveFormOverlayProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
    if (!open && wasOpenRef.current) {
      returnFocusRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isBusy) {
      return;
    }
    onOpenChange(nextOpen);
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          showCloseButton={!isBusy}
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isBusy) event.preventDefault();
          }}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
            {children}
          </div>
          <SheetFooter>{footer}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      dismissible={!isBusy}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {children}
        </div>
        <DrawerFooter>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
