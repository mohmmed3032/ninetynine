'use client'

import { useState } from 'react'
import { login } from '../actions'
import { Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError('')
    
    const result = await login(formData)
    
    // If we get here, login failed (redirect would have happened on success)
    if (result?.error) {
      setError(result.error)
    }
    setPending(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">لوحة التحكم</h1>
          <p className="text-warm-gray mt-1">صالة العرض - ليبيا</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-beige/50 p-8">
          <h2 className="text-lg font-semibold text-charcoal mb-6 text-center">
            تسجيل الدخول
          </h2>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أدخل كلمة المرور"
                  className="w-full px-5 py-3 pr-12 pl-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 text-charcoal placeholder:text-warm-gray transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
            >
              {pending ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="text-center text-xs text-warm-gray mt-6">
            الموقع للعرض فقط - لا يوجد نظام طلبات
          </p>
        </div>
      </div>
    </div>
  )
}