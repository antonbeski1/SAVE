'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  BellRing,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/alerts', icon: BellRing, label: 'Alerts' },
  { href: '/logs', icon: History, label: 'Event Logs' },
  { href: '/users', icon: Users, label: 'User Management' },
  { href: '/automation', icon: Workflow, label: 'Automation' },
  { href: '/analyze-risk', icon: ShieldAlert, label: 'Risk Analysis' },
  { href: '/diagnostics', icon: HeartPulse, label: 'Data Diagnostics' },
  { href: '/overrides', icon: SlidersHorizontal, label: 'Manual Overrides' },
  { href: '/ground-truth', icon: Target, label: 'Ground Truth' },
  { href: '/models', icon: Package, label: 'Model Registry' },
  { href: '/templates', icon: FileText, label: 'Alert Templates' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/user/32/32" alt="@admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href="/">
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <LifeBuoy className="h-6 w-6 text-primary" />
              <span className="">SAVE</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <TooltipProvider>
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                   <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                          pathname === item.href
                            ? 'bg-muted text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </nav>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="mb-4 flex items-center gap-2 text-lg font-semibold"
                >
                  <LifeBuoy className="h-6 w-6 text-primary" />
                  <span className="">SAVE</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      pathname === item.href
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Can add breadcrumbs or search here if needed */}
          </div>
          {userMenu}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
