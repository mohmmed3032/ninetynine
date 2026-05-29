import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionTitle({ title, subtitle, centered = true, className }: SectionTitleProps) {
  return (
    <div className={cn('mb-10', centered && 'text-center', className)}>
      <div className={cn('flex items-center gap-3 mb-3', centered && 'justify-center')}>
        <div className="h-px w-12 bg-gold/50" />
        <span className="text-sm font-medium text-gold uppercase tracking-wider">{subtitle}</span>
        <div className="h-px w-12 bg-gold/50" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-charcoal">{title}</h2>
    </div>
  )
}
