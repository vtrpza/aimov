'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Menu, LogOut, User as UserIcon, MessageSquare, Home, Users, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, loading } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggingOut(false)
    router.push('/')
    router.refresh()
  }

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Imóveis', href: '/properties', icon: Building2 },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Chat IA', href: '/chat', icon: MessageSquare },
  ]

  const isActive = (href: string) => pathname === href

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block font-bold text-lg">
            Assistente Imobiliário IA
          </span>
          <span className="sm:hidden font-bold text-lg">
            Imóveis IA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(item.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Minha Conta</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chat" className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Chat IA</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/properties" className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Imóveis</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              {/* User Info (Mobile) */}
              {user && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Minha Conta</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.href}
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className="justify-start h-12"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={item.href}>
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </Button>
                  )
                })}
              </nav>

              {/* Auth Actions (Mobile) */}
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t">
                {user ? (
                  <Button
                    variant="destructive"
                    className="justify-start h-12"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start h-12"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/login">
                        <UserIcon className="mr-3 h-5 w-5" />
                        Entrar
                      </Link>
                    </Button>
                    <Button
                      className="justify-start h-12"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/signup">
                        <UserIcon className="mr-3 h-5 w-5" />
                        Cadastrar
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
