export const metadata = {
  title: 'لوحة التحكم | صالة العرض',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      {children}
    </div>
  )
}
