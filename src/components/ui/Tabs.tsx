import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { clsx } from 'clsx'

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={clsx(
      'inline-flex items-center justify-start border-b border-white/10 p-0 text-white/60 gap-4 sm:gap-8 overflow-x-auto no-scrollbar',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={clsx(
      'group relative inline-flex items-center justify-center whitespace-nowrap pb-3 pt-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-ivory data-[state=inactive]:text-white/50 hover:text-ivory',
      className
    )}
    {...props}
  >
    {children}
    <span
      className="absolute bottom-0 left-0 h-px w-full bg-gold scale-x-0 transition-transform duration-300 ease-out group-data-[state=active]:scale-x-100"
      aria-hidden="true"
    />
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={clsx(
      'mt-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ring-offset-wine-deep',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
