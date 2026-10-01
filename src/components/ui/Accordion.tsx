import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { clsx } from 'clsx'

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={clsx('border-b border-white/10 transition-colors', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={clsx(
        'group flex flex-1 items-center justify-between py-5 font-serif text-lg md:text-xl font-light text-ivory text-left transition-all hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold [&[data-state=open]>svg]:rotate-45',
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden font-sans text-sm md:text-base text-white/70 leading-relaxed font-light radix-accordion-content"
    {...props}
  >
    <div className={clsx('pb-6 pt-1', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName
