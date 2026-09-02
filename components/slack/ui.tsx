'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Stack({direction='vertical', align, justify, gap='normal', className, style, children, ...props}: any) {
  const gaps:any={none:'gap-0',condensed:'gap-1',normal:'gap-3',spacious:'gap-5'}
  return <div className={cn('flex', direction==='horizontal'?'flex-row':'flex-col', align&&`items-${align==='center'?'center':align==='start'?'start':'end'}`, justify&&`justify-${justify==='space-between'?'between':justify==='end'?'end':'start'}`,gaps[gap]||gap,className)} style={style} {...props}>{children}</div>
}
export const Text:any = ({size='medium',weight,className,children,...props}:any)=> <span className={cn(size==='small'?'text-xs':size==='large'?'text-base':'text-sm',weight==='semibold'?'font-semibold':weight==='bold'?'font-bold':'',className)} {...props}>{children}</span>
Text.Label=({children}:any)=><span className="text-sm font-medium">{children}</span>
Text.Caption=({children}:any)=><span className="text-xs text-muted-foreground">{children}</span>
export function Heading({as:Tag='h2',size='medium',className,children,...props}:any){return <Tag className={cn('font-semibold tracking-tight',size==='small'?'text-sm':size==='large'?'text-xl':'text-base',className)} {...props}>{children}</Tag>}
export function Button({variant='default',size='medium',className,children,...props}:any){return <button className={cn('inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',variant==='invisible'?'border-transparent bg-transparent hover:bg-muted':variant==='danger'?'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90':variant==='outline'?'border-border bg-background hover:bg-muted':'border-primary bg-primary text-primary-foreground hover:bg-primary/90',size==='small'?'h-8 px-2 text-xs':'',className)} {...props}>{children}</button>}
export function IconButton({icon:Icon, size='medium', className, ...props}:any){return <button className={cn('inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',size==='small'?'size-7':'',className)} {...props}>{Icon&&<Icon />}</button>}
export function TextInput({leadingVisual:Icon, block, className, ...props}:any){return <div className={cn('relative',block&&'w-full')} >{Icon&&<Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />}<input className={cn('h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',Icon&&'pl-9',className)} {...props}/></div>}
export function Textarea({className,...props}:any){return <textarea className={cn('min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',className)} {...props}/ >}
export function Avatar({src,alt,fallback,size=32,className}:any){return <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-medium',size<=24?'size-6':size<=32?'size-8':'size-10',className)}>{src?<img src={src} alt={alt||''} className="size-full object-cover"/>:<span>{fallback}</span>}</div>}
export function AvatarStack({children,...props}:any){return <div className="flex -space-x-2" {...props}>{children}</div>}
export function Label({children,className,...props}:any){return <span className={cn('inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium',className)} {...props}>{children}</span>}
export const Blankslate:any = ({children,className,...props}:any)=><div className={cn('flex flex-col items-center justify-center p-8 text-center',className)} {...props}>{children}</div>
Blankslate.Visual=({children}:any)=><div className="mb-3">{children}</div>
Blankslate.Heading=({children}:any)=><h3 className="font-semibold">{children}</h3>
Blankslate.Description=({children}:any)=><p className="text-sm text-muted-foreground">{children}</p>
export const Checkbox=({checked,onChange,...props}:any)=><input type="checkbox" checked={checked} onChange={onChange} {...props}/>
export const Dialog:any=({title,children}:any)=><div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="w-full max-w-md rounded-lg border bg-card p-6"><h2 className="mb-4 font-semibold">{title}</h2>{children}</div></div>
Dialog.Header=({children}:any)=><div className="mb-4">{children}</div>
Dialog.Title=({children}:any)=><h2 className="text-lg font-semibold">{children}</h2>
Dialog.Body=({children}:any)=><div>{children}</div>
Dialog.Footer=({children}:any)=><div className="mt-5 flex justify-end gap-2">{children}</div>
export function AnchoredOverlay({open,children}:any){return open?<div className="absolute right-0 top-full z-50 mt-2 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">{children}</div>:null}
export const ActionMenu:any = ({children}:any)=><div className="relative">{children}</div>
ActionMenu.Anchor=({children}:any)=><>{children}</>
ActionMenu.Overlay=({children}:any)=><div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">{children}</div>
export const ActionList:any = ({children}:any)=><div className="flex flex-col">{children}</div>
ActionList.Item=({children,onSelect,className}:any)=><button className={cn('flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted',className)} onClick={onSelect}>{children}</button>
ActionList.LeadingVisual=({children}:any)=><span className="flex shrink-0">{children}</span>
ActionList.Description=({children}:any)=><span className="ml-auto text-xs text-muted-foreground">{children}</span>
ActionList.Divider=()=> <div className="my-1 border-t"/>
export const NavList:any = ({children}:any)=><nav className="flex flex-col gap-0.5">{children}</nav>
NavList.Divider=()=> <div className="my-2 border-t"/>
NavList.Item=({children,onClick,selected,className}:any)=><button className={cn('flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground',selected&&'bg-accent text-accent-foreground',className)} onClick={onClick}>{children}</button>
NavList.LeadingVisual=({children}:any)=><span className="flex shrink-0">{children}</span>
NavList.TrailingVisual=({children}:any)=><span className="ml-auto">{children}</span>
NavList.Group=({children}:any)=><div className="flex flex-col gap-0.5">{children}</div>
NavList.GroupHeading=({children}:any)=><div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</div>
export const Link=({children,...props}:any)=><a className="text-primary underline-offset-4 hover:underline" {...props}>{children}</a>
export const Tooltip=({children}:any)=>children
export const CounterLabel=({children}:any)=><span className="rounded-full bg-muted px-1.5 text-xs">{children}</span>
export const FormControl:any=({children}:any)=><div className="flex flex-col gap-1">{children}</div>
FormControl.Label=({children}:any)=><label className="text-sm font-medium">{children}</label>
FormControl.Caption=({children}:any)=><span className="text-xs text-muted-foreground">{children}</span>
export const Octicon=({icon:Icon}:any)=><Icon />
