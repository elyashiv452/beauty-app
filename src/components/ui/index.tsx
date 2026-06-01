'use client'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

// ── Badge ────────────────────────────────────────────────────
type BadgeVariant = 'teal' | 'purple' | 'amber' | 'red' | 'green' | 'gray' | 'pink'
const badgeStyles: Record<BadgeVariant, string> = {
  teal:   'bg-teal-50 text-teal-700 border border-teal-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  amber:  'bg-amber-50 text-amber-700 border border-amber-200',
  red:    'bg-red-50 text-red-700 border border-red-200',
  green:  'bg-green-50 text-green-700 border border-green-200',
  gray:   'bg-gray-100 text-gray-600 border border-gray-200',
  pink:   'bg-pink-50 text-pink-700 border border-pink-200',
}
export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeStyles[variant]}`}>
      {children}
    </span>
  )
}

// ── Status Badge ─────────────────────────────────────────────
import { LeadStatus } from '@/types'
const statusVariants: Record<LeadStatus, BadgeVariant> = {
  new: 'amber', contacted: 'purple', active: 'teal',
  quote: 'pink', closed: 'green', lost: 'gray',
}
import { LEAD_STATUS_LABELS } from '@/lib/utils'
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={statusVariants[status]}>{LEAD_STATUS_LABELS[status]}</Badge>
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'gray' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${color === 'teal' ? 'text-teal-600' : color === 'red' ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Button ───────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const btnStyles: Record<BtnVariant, string> = {
  primary:   'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  ghost:     'text-gray-600 hover:bg-gray-100',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
}
export function Button({
  children, onClick, variant = 'secondary', className = '', disabled = false, type = 'button'
}: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant
  className?: string; disabled?: boolean; type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide = false }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────
export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input
        {...props}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
      />
    </div>
  )
}

// ── Select ───────────────────────────────────────────────────
export function Select({ label, children, ...props }: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <select
        {...props}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900"
      >
        {children}
      </select>
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────────
export function Textarea({ label, ...props }: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <textarea
        {...props}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 resize-none"
      />
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <div className="text-gray-500 font-medium">{title}</div>
      {sub && <div className="text-gray-400 text-sm mt-1">{sub}</div>}
    </div>
  )
}
