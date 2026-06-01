'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, UserCircle,
  CreditCard, Image, TrendingUp, Sparkles
} from 'lucide-react'

const nav = [
  { href: '/', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/leads', label: 'לידים', icon: Sparkles },
  { href: '/clients', label: 'לקוחות', icon: UserCircle },
  { href: '/appointments', label: 'תורים', icon: Calendar },
  { href: '/payments', label: 'תשלומים', icon: CreditCard },
  { href: '/portfolio', label: 'תיק עבודות', icon: Image },
  { href: '/revenue', label: 'הכנסות', icon: TrendingUp },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-white border-l border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">BeautyPro</div>
            <div className="text-xs text-gray-400">ניהול עסק</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={active ? 'text-teal-600' : 'text-gray-400'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-sm">
            מ
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">שם המאפרת</div>
            <div className="text-xs text-gray-400">עוסק פטור</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
