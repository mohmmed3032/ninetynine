'use client'

import { useState, useEffect, useCallback, useRef, useMemo, KeyboardEvent, ChangeEvent, CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ShoppingBag,
  Search,
  X,
  ArrowLeft,
  Package,
  TrendingDown,
  Star,
  ChevronLeft,
  ChevronRight,
  Percent,
  AlertTriangle,
  Upload,
  MoreVertical,
  Palette,
  Settings,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Globe,
  Layers,
} from 'lucide-react'
import {
  logout,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addDiscount,
  removeDiscount,
  saveContact,
  toggleNewTag,
  uploadImage,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from './actions'
import { createClient as createBrowserClient } from '@/lib/supabase-browser'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'products' | 'add' | 'stats' | 'contact' | 'categories'
type AddStep = 1 | 2

const CLOTHES_COLORS = ['أسود', 'أبيض', 'بيج', 'ذهبي', 'وردي', 'رمادي', 'نيلي', 'أحمر', 'بني', 'أزرق فاتح', 'أزرق غامق', 'أخضر زيتوني', 'كريمي', 'وردي فاتح']
const SHOES_COLORS = ['أسود', 'أبيض', 'بيج', 'ذهبي', 'وردي', 'رمادي', 'بني', 'أحمر']

const QUICK = ['#E8735A', '#D4A0A0', '#BDB2FF', '#FFD6A5', '#8FAE82', '#0D9488', '#D97706', '#F0D9BC']

function hsvToHex(h: number, s: number, v: number) {
  s /= 100; v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r: number, g: number, b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else[r, g, b] = [c, 0, x]
  return `#${[r, g, b].map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('')}`
}

function hexToHsv(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d % 6) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
    if (h < 0) h += 360
  }
  return { h, s: max ? (d / max) * 100 : 0, v: max * 100 }
}

function luma(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function CustomColorPickerModal({ onAdd, onClose }: { onAdd: (payload: { name: string; hex: string }) => void; onClose: () => void }) {
  const [hue, setHue] = useState(35)
  const [sat, setSat] = useState(48)
  const [val, setVal] = useState(79)
  const [hexInput, setHexInput] = useState('')
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState(false)

  const svRef = useRef<HTMLDivElement | null>(null)
  const hueRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef({ sv: false, hue: false })

  const hex = hsvToHex(hue, sat, val)
  const pureHex = hsvToHex(hue, 100, 100)
  const isLight = luma(hex) > 0.55

  useEffect(() => { setHexInput(hex.toUpperCase()) }, [hex])

  const pickSV = useCallback((cx: number, cy: number) => {
    if (!svRef.current) return
    const r = svRef.current.getBoundingClientRect()
    setSat(Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100)))
    setVal(Math.max(0, Math.min(100, (1 - (cy - r.top) / r.height) * 100)))
  }, [])

  const pickHue = useCallback((cx: number) => {
    if (!hueRef.current) return
    const r = hueRef.current.getBoundingClientRect()
    setHue(Math.max(0, Math.min(360, ((cx - r.left) / r.width) * 360)))
  }, [])

  const applyHex = (h: string) => {
    const hsv = hexToHsv(h)
    if (hsv) { setHue(hsv.h); setSat(hsv.s); setVal(hsv.v) }
  }

  useEffect(() => {
    const mv = (e: MouseEvent | TouchEvent) => {
      if (!drag.current.sv && !drag.current.hue) return
      if ('cancelable' in e && e.cancelable) e.preventDefault()
      const [x, y] = 'touches' in e
        ? [e.touches[0].clientX, e.touches[0].clientY]
        : [e.clientX, e.clientY]
      if (drag.current.sv) pickSV(x, y)
      if (drag.current.hue) pickHue(x)
    }
    const up = () => { drag.current.sv = false; drag.current.hue = false }
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', mv, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', mv)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', mv)
      window.removeEventListener('touchend', up)
    }
  }, [pickSV, pickHue])

  const handleHexInput = (e: ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value)
    const h = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
    if (/^#[0-9a-fA-F]{6}$/.test(h)) applyHex(h.toLowerCase())
  }

  const submit = () => {
    if (!name.trim()) { setNameErr(true); return }
    onAdd({ name: name.trim(), hex })
  }

  const S = styles

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-overlay" onClick={onClose} style={S.overlay}>
        <div className="cp-sheet" onClick={(e) => e.stopPropagation()} style={S.sheet}>
          <div style={S.header}>
            <div style={S.headerLeft}>
              <div style={{
                ...S.headerSwatch,
                background: hex,
                boxShadow: `0 6px 20px ${hex}88`,
                border: isLight ? '2px solid #E8DFD0' : '2px solid rgba(255,255,255,0.2)',
              }} />
              <div>
                <div style={S.title}>إضافة لون مخصص</div>
                <div style={S.subtitle}>{name || 'اختيار لون للمنتج'}</div>
              </div>
            </div>
            <button className="cp-close" onClick={onClose} style={S.closeBtn}>✕</button>
          </div>

          <div
            ref={svRef}
            onMouseDown={(e) => { drag.current.sv = true; pickSV(e.clientX, e.clientY) }}
            onTouchStart={(e) => { e.preventDefault(); drag.current.sv = true; pickSV(e.touches[0].clientX, e.touches[0].clientY) }}
            style={{
              ...S.svPicker,
              background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${pureHex})`,
            }}
          >
            <div style={{
              ...S.svCursor,
              left: `${sat}%`,
              top: `${100 - val}%`,
              background: hex,
              border: `2.5px solid ${isLight && val > 60 ? '#444' : '#fff'}`,
            }} />
          </div>

          <div
            ref={hueRef}
            onMouseDown={(e) => { drag.current.hue = true; pickHue(e.clientX) }}
            onTouchStart={(e) => { e.preventDefault(); drag.current.hue = true; pickHue(e.touches[0].clientX) }}
            style={S.hueBar}
          >
            <div style={{
              ...S.hueCursor,
              left: `${(hue / 360) * 100}%`,
              background: pureHex,
            }} />
          </div>

          <div style={S.quickRow}>
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => applyHex(q)}
                className="cp-swatch"
                style={{
                  ...S.quickSwatch,
                  background: q,
                  border: hex.toLowerCase() === q.toLowerCase()
                    ? '2.5px solid #C9A96E'
                    : '2px solid #E8DFD0',
                  boxShadow: hex.toLowerCase() === q.toLowerCase()
                    ? '0 0 0 2px #C9A96E44'
                    : 'none',
                }}
              />
            ))}
          </div>

          <div style={S.hexRow}>
            <div style={{
              ...S.hexPreview,
              background: hex,
              border: isLight ? '2px solid #E8DFD0' : '2px solid transparent',
              boxShadow: `0 4px 14px ${hex}55`,
            }} />
            <div style={S.hexInputWrap}>
              <div style={S.hexLabel}>HEX</div>
              <input
                className="cp-input"
                type="text"
                value={hexInput}
                onChange={handleHexInput}
                dir="ltr"
                style={S.hexInput}
              />
            </div>
          </div>

          <div style={S.nameWrap}>
            <div style={S.nameHeader}>
              <label style={S.nameLabel}>اسم اللون</label>
              {name.trim() && (
                <div style={S.nameBadge}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: hex, flexShrink: 0, border: '1px solid #E8DFD0' }} />
                  <span style={{ fontSize: 11, color: '#2C2C2C', fontWeight: 600 }}>{name}</span>
                </div>
              )}
            </div>
            <input
              className="cp-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(false) }}
              placeholder="مثال: زهري كلاسيكي، ذهبي داكن..."
              dir="rtl"
              style={{
                ...S.nameInput,
                borderColor: nameErr ? '#EF4444' : '#E8DFD0',
              }}
            />
            {nameErr && <p style={S.errText}>أدخلي اسم اللون</p>}
          </div>

          <div style={S.btnRow}>
            <button className="cp-btn-add" onClick={submit} style={S.btnAdd}>
              إضافة اللون
            </button>
            <button className="cp-btn-cancel" onClick={onClose} style={S.btnCancel}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(28,28,28,0.6)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'flex-end',
  },
  sheet: {
    background: '#fff', width: '100%',
    borderRadius: '24px 24px 0 0',
    padding: '22px 20px',
    paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
    maxHeight: '92dvh', overflowY: 'auto',
    boxShadow: '0 -16px 48px rgba(0,0,0,0.14)',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerSwatch: {
    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
    transition: 'background .12s, box-shadow .2s, border-color .15s',
  },
  title: { fontSize: 16, fontWeight: 700, color: '#2C2C2C', lineHeight: 1.2 },
  subtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    border: '1.5px solid #E8DFD0', background: '#FAF7F2',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, color: '#9CA3AF', flexShrink: 0,
    transition: 'all .15s',
  },
  svPicker: {
    width: '100%', height: 160, borderRadius: 16,
    position: 'relative', cursor: 'crosshair', marginBottom: 12,
    touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
    overflow: 'hidden',
  },
  svCursor: {
    position: 'absolute', transform: 'translate(-50%,-50%)',
    width: 22, height: 22, borderRadius: '50%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
    pointerEvents: 'none', transition: 'border-color .1s',
  },
  hueBar: {
    width: '100%', height: 28, borderRadius: 14, position: 'relative',
    background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
    cursor: 'pointer', marginBottom: 14,
    touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
  },
  hueCursor: {
    position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
    width: 26, height: 26, borderRadius: '50%',
    border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
  quickRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 },
  quickSwatch: {
    width: 28, height: 28, borderRadius: '50%',
    cursor: 'pointer', transition: 'transform .12s, border-color .12s',
    padding: 0,
  },
  hexRow: { display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' },
  hexPreview: {
    width: 48, height: 48, borderRadius: 13, flexShrink: 0,
    transition: 'background .1s, box-shadow .15s',
  },
  hexInputWrap: { flex: 1 },
  hexLabel: {
    fontSize: 10, fontWeight: 700, color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 5,
  },
  hexInput: {
    width: '100%', padding: '9px 12px', borderRadius: 12,
    background: '#FAF7F2', border: '1.5px solid #E8DFD0',
    fontSize: 13, fontFamily: 'monospace', color: '#2C2C2C',
    letterSpacing: 1.2, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  },
  nameWrap: { marginBottom: 20 },
  nameHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  nameLabel: { fontSize: 13, fontWeight: 700, color: '#2C2C2C' },
  nameBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', background: '#FAF7F2', borderRadius: 8,
    border: '1.5px solid #C9A96E',
    transition: 'all .15s',
  },
  nameInput: {
    width: '100%', padding: '12px 14px', borderRadius: 14,
    background: '#FAF7F2', borderWidth: 1.5, borderStyle: 'solid',
    fontSize: 14, color: '#2C2C2C', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s',
  },
  errText: { margin: '4px 0 0', fontSize: 12, color: '#EF4444' },
  btnRow: { display: 'flex', gap: 10 },
  btnAdd: {
    flex: 1, padding: '14px 0',
    background: '#C9A96E', color: '#fff',
    borderRadius: 14, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(201,169,110,0.35)',
    transition: 'all .2s',
  },
  btnCancel: {
    flex: 1, padding: '14px 0',
    background: '#FAF7F2', color: '#2C2C2C',
    borderRadius: 14, border: '1.5px solid #E8DFD0', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, transition: 'background .15s',
  },
}

const CSS = `
  .cp-overlay { animation: cpFade .2s ease both; }
  .cp-sheet { animation: cpRise .28s cubic-bezier(.34,1.4,.64,1) both; }
  @keyframes cpFade { from { opacity:0 } to { opacity:1 } }
  @keyframes cpRise { from { opacity:0; transform:translateY(36px) } to { opacity:1; transform:translateY(0) } }
  @media (min-width:640px) {
    .cp-sheet {
      border-radius: 24px !important;
      max-width: 400px !important;
      margin: 0 auto;
    }
  }
  .cp-input:focus {
    border-color: #C9A96E !important;
    box-shadow: 0 0 0 3px rgba(201,169,110,0.18) !important;
  }
  .cp-swatch:hover { transform: scale(1.15); }
  .cp-close:hover { border-color: #C9A96E !important; color: #C9A96E !important; }
  .cp-btn-add:hover {
    background: #b8935c !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(201,169,110,0.45) !important;
  }
  .cp-btn-cancel:hover { background: #E8DFD0 !important; }
`

const CLOTHES_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const SHOES_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43']

const TAG_OPTIONS = ['جديد', 'تخفيض']

const COLOR_SWATCHES: Record<string, string> = {
  'أسود': '#1a1a1a', 'أبيض': '#ffffff', 'بيج': '#E8DFD0', 'ذهبي': '#C9A96E',
  'وردي': '#F5E6E0', 'وردي فاتح': '#FDF2F0', 'رمادي': '#9CA3AF', 'نيلي': '#1e3a5f',
  'أحمر': '#DC2626', 'بني': '#8B4513', 'أزرق فاتح': '#93C5FD', 'أزرق غامق': '#1E40AF',
  'أخضر زيتوني': '#6B7C3E', 'كريمي': '#FFFDD0',
}

interface UploadedImage {
  url: string
  file?: File
  uploading?: boolean
}

interface CustomColor {
  name: string
  value: string
}

interface ContactInfo {
  whatsapp: string
  phone: string
  email: string
  address: string
  instagram: string
  facebook: string
  footerText: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [activeProductMenu, setActiveProductMenu] = useState<string | null>(null)

  const [discountModal, setDiscountModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [removeDiscountModal, setRemoveDiscountModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [newDiscountPrice, setNewDiscountPrice] = useState('')

  // Custom color modal
  const [customColorModal, setCustomColorModal] = useState<{ open: boolean }>({ open: false })
  const [customColors, setCustomColors] = useState<CustomColor[]>([])

  const [deleteCatModal, setDeleteCatModal] = useState<{
    open: boolean
    cat: any | null
    count: number
  }>({ open: false, cat: null, count: 0 })

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    whatsapp: '218945239468',
    phone: '+218 94-5239468',
    email: 'info@showroom.ly',
    address: 'طرابلس، ليبيا',
    instagram: '#',
    facebook: '#',
    footerText: 'وجهتك الأولى لأحدث صيحات الموضة والأناقة في ليبيا. نقدم لكِ تشكيلة فريدة من الملابس والعطور والأحذية الفاخرة.',
  })
  const [contactLoading, setContactLoading] = useState(false)

  const [message, setMessage] = useState('')

  const [addStep, setAddStep] = useState<AddStep>(1)
  const [wizardData, setWizardData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: [] as UploadedImage[],
    colors: [] as string[],
    sizes: [] as string[],
    customSize: '',
    tags: [] as string[],
  })

  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    slug: '',
    image: '',
    isMain: false,
  })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editingId: string | null }>({ open: false, editingId: null })
  const [categoryImageUpload, setCategoryImageUpload] = useState<{ url: string; uploading: boolean } | null>(null)
  const [catDragOver, setCatDragOver] = useState(false)
  const catFileInputRef = useRef<HTMLInputElement | null>(null)

  const allColorSwatches = useMemo(() => {
    const merged = { ...COLOR_SWATCHES }
    customColors.forEach((c) => { merged[c.name] = c.value })
    return merged
  }, [customColors])

  const loadProducts = useCallback(async () => {
    const data = await getAllProducts()
    setProducts(data)
    setLoading(false)
  }, [])

  const loadCategories = useCallback(async () => {
    const data = await getAllCategories()
    setCategories(data)
  }, [])

  async function handleDeleteCategory(cat: any) {
    const res = await deleteCategory(cat.id, false) // check first, no cascade
    if (res.hasProducts) {
      setDeleteCatModal({ open: true, cat, count: res.count || 0 })
      return
    }
    if (res.success) {
      setMessage('🗑️ تم حذف الفئة')
      loadCategories()
    } else {
      setMessage(`❌ ${res.error}`)
    }
    setTimeout(() => setMessage(''), 3000)
  }

  async function confirmDeleteCategoryCascade() {
    if (!deleteCatModal.cat) return
    const res = await deleteCategory(deleteCatModal.cat.id, true) // cascade
    if (res.success) {
      setMessage(`🗑️ تم حذف الفئة و ${res.deletedProducts} منتجات مرتبطة بها`)
      loadCategories()
    } else {
      setMessage(`❌ ${res.error}`)
    }
    setDeleteCatModal({ open: false, cat: null, count: 0 })
    setTimeout(() => setMessage(''), 4000)
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
      ; (async () => {
        try {
          const client = createBrowserClient()
          const { data } = await client.from('site_settings').select('*').single()
          if (data) {
            setContactInfo({
              whatsapp: data.whatsapp || contactInfo.whatsapp,
              phone: data.phone || contactInfo.phone,
              email: data.email || contactInfo.email,
              address: data.address || contactInfo.address,
              instagram: data.instagram || contactInfo.instagram,
              facebook: data.facebook || contactInfo.facebook,
              footerText: data.footer_text || contactInfo.footerText,
            })
          }
        } catch (e) {
          // ignore
        }
        const savedColors = localStorage.getItem('showroom_custom_colors')
        if (savedColors) setCustomColors(JSON.parse(savedColors))
      })()
  }, [loadProducts, loadCategories])

  useEffect(() => {
    const handleClick = () => setActiveProductMenu(null)
    if (activeProductMenu) window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [activeProductMenu])

  const totalProducts = products.length
  const totalDiscounts = products.filter((p) => p.oldPrice).length
  const totalNew = products.filter((p) => p.tags.includes('جديد')).length
  const productCategories = Array.from(new Set(products.map((p) => p.category)))

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetWizard = () => {
    setAddStep(1)
    setWizardData({
      name: '', category: '', price: '', description: '',
      images: [], colors: [], sizes: [], customSize: '', tags: [],
    })
    setCustomColors([])
  }

  const toggleWizardArray = (field: 'colors' | 'sizes' | 'tags', value: string) => {
    setWizardData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const openCategoryModal = (cat?: any) => {
    if (cat) {
      setCategoryForm({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image || '',
        isMain: cat.is_main,
      })
      setCategoryImageUpload(cat.image ? { url: cat.image, uploading: false } : null)
      setCategoryModal({ open: true, editingId: cat.id })
    } else {
      setCategoryForm({ id: '', name: '', slug: '', image: '', isMain: false })
      setCategoryImageUpload(null)
      setCategoryModal({ open: true, editingId: null })
    }
  }

  const closeCategoryModal = () => {
    setCategoryModal({ open: false, editingId: null })
    setCategoryImageUpload(null)
    setCatDragOver(false)
  }

  const handleCategoryImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setCategoryImageUpload({ url: '', uploading: true })
    const formData = new FormData()
    formData.append('image', file)
    const result = await uploadImage(formData)
    if (result.success && result.url) {
      setCategoryImageUpload({ url: result.url, uploading: false })
      setCategoryForm(prev => ({ ...prev, image: result.url }))
    } else {
      setMessage(`❌ ${result.error || 'فشل الرفع'}`)
      setCategoryImageUpload(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleCatDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setCatDragOver(true)
  }
  const handleCatDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setCatDragOver(false)
  }
  const handleCatDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setCatDragOver(false)
    handleCategoryImageUpload(e.dataTransfer.files)
  }

  const submitCategoryModal = async () => {
    let slug = categoryForm.slug
    if (!categoryModal.editingId) {
      const numericSlugs = categories
        .map((c: any) => c.slug)
        .filter((s: string) => /^\d+$/.test(s))
        .map(Number)
      const nextNum = numericSlugs.length > 0 ? Math.max(...numericSlugs) + 1 : 0
      slug = String(nextNum)
    }

    const formData = new FormData()
    formData.append('name', categoryForm.name)
    formData.append('slug', slug)
    formData.append('image', categoryForm.image)
    formData.append('isMain', categoryForm.isMain ? 'true' : 'false')

    if (categoryModal.editingId) {
      const res = await updateCategory(categoryModal.editingId, formData)
      if (res.success) {
        setMessage('✅ تم تحديث الفئة')
        closeCategoryModal()
        loadCategories()
      } else {
        setMessage(`❌ ${res.error}`)
      }
    } else {
      const res = await addCategory(formData)
      if (res.success) {
        setMessage('✅ تم إضافة الفئة')
        closeCategoryModal()
        loadCategories()
      } else {
        setMessage(`❌ ${res.error}`)
      }
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const canGoToStep2 = wizardData.name.trim() && wizardData.category && Number(wizardData.price) > 0

  const addCustomSize = () => {
    let trimmed = wizardData.customSize.trim()
    if (!trimmed) return

    if (wizardData.category === 'عطور' && !trimmed.toLowerCase().endsWith('ml')) {
      trimmed = trimmed + 'ml'
    }

    if (wizardData.sizes.includes(trimmed)) {
      setWizardData((prev) => ({ ...prev, customSize: '' }))
      return
    }
    setWizardData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, trimmed],
      customSize: '',
    }))
  }

  const handleCustomSizeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomSize()
    }
  }

  const openCustomColorModal = () => {
    setCustomColorModal({ open: true })
  }

  const addCustomColor = ({ name, hex }: { name: string; hex: string }) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setMessage('❌ أدخلي اسم اللون')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (COLOR_SWATCHES[trimmedName] || customColors.find((c) => c.name === trimmedName)) {
      setMessage('❌ هذا اللون موجود بالفعل')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    const newColors = [...customColors, { name: trimmedName, value: hex }]
    setCustomColors(newColors)
    localStorage.setItem('showroom_custom_colors', JSON.stringify(newColors))
    // Auto-select it
    if (editingProduct) {
      toggleEditArray('colors', trimmedName)
    } else {
      toggleWizardArray('colors', trimmedName)
    }
    setCustomColorModal({ open: false })
  }

  const removeCustomColor = (name: string) => {
    const newColors = customColors.filter((c) => c.name !== name)
    setCustomColors(newColors)
    localStorage.setItem('showroom_custom_colors', JSON.stringify(newColors))
    if (wizardData.colors.includes(name)) {
      toggleWizardArray('colors', name)
    }
    if (editForm.colors.includes(name)) {
      toggleEditArray('colors', name)
    }
  }

  const editFileInputRef = useRef<HTMLInputElement>(null)

  const handleEditImageUpload = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('image', file)
      const result = await uploadImage(formData)
      if (result.success && result.url) {
        setEditForm(prev => ({ ...prev, images: [...prev.images, result.url!] }))
      } else {
        setMessage(`❌ ${result.error || 'فشل الرفع'}`)
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const removeEditImage = (index: number) => {
    setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      setWizardData((prev) => ({
        ...prev,
        images: [...prev.images, { url: '', file, uploading: true }],
      }))

      const formData = new FormData()
      formData.append('image', file)

      const result = await uploadImage(formData)

      setWizardData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.file === file
            ? { url: result.success ? result.url : '', uploading: false }
            : img
        ),
      }))

      if (!result.success) {
        setMessage(`❌ ${result.error}`)
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const removeImage = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleImageUpload(e.dataTransfer.files)
  }

  async function handleAddProductSubmit() {
    const imageUrls = wizardData.images.map((img) => img.url).filter(Boolean)
    if (imageUrls.length === 0) {
      setMessage('❌ أضيفي صورة واحدة على الأقل')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    let trimmedCustom = wizardData.customSize.trim()
    let finalSizes = [...wizardData.sizes]
    if (trimmedCustom) {
      let size = trimmedCustom
      if (wizardData.category === 'عطور' && !size.toLowerCase().endsWith('ml')) {
        size = size + 'ml'
      }
      if (!finalSizes.includes(size)) {
        finalSizes = [...finalSizes, size]
      }
    }

    const formData = new FormData()
    formData.append('name', wizardData.name)
    formData.append('category', wizardData.category)
    formData.append('price', wizardData.price)
    formData.append('description', wizardData.description)
    formData.append('images', imageUrls.join(', '))
    formData.append('colors', wizardData.colors.join(', '))
    formData.append('sizes', finalSizes.join(', '))
    formData.append('tags', wizardData.tags.join(', '))

    const result = await addProduct(formData)
    if (result.success) {
      setMessage('✅ تم إضافة المنتج بنجاح')
      setActiveTab('products')
      resetWizard()
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const [editForm, setEditForm] = useState({
    name: '', category: '', price: '', description: '',
    images: [] as string[], colors: [] as string[], sizes: [] as string[], tags: [] as string[],
  })

  const initEditForm = (product: Product) => {
    setEditForm({
      name: product.name, category: product.category,
      price: product.price.toString(),
      description: product.description, images: [...product.images],
      colors: [...product.colors], sizes: [...product.sizes], tags: [...product.tags],
    })
  }

  const toggleEditArray = (field: 'colors' | 'sizes' | 'tags', value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  async function handleUpdateProduct() {
    if (!editingProduct) return
    const formData = new FormData()
    formData.append('name', editForm.name)
    formData.append('category', editForm.category)
    formData.append('price', editForm.price)
    formData.append('description', editForm.description)
    formData.append('images', editForm.images.join(', '))
    formData.append('colors', editForm.colors.join(', '))
    formData.append('sizes', editForm.sizes.join(', '))
    formData.append('tags', editForm.tags.join(', '))

    const result = await updateProduct(editingProduct.id, formData)
    if (result.success) {
      setMessage('✅ تم تحديث المنتج بنجاح')
      setEditingProduct(null)
      setActiveTab('products')
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنتِ متأكدة من حذف هذا المنتج؟')) return
    const result = await deleteProduct(id)
    if (result.success) {
      setMessage('🗑️ تم حذف المنتج')
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleAddDiscount() {
    if (!discountModal.product || !newDiscountPrice) return
    const result = await addDiscount(discountModal.product.id, Number(newDiscountPrice))
    if (result.success) {
      setMessage('💰 تم إضافة التخفيض بنجاح')
      setDiscountModal({ open: false, product: null })
      setNewDiscountPrice('')
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    } else if (result.error) {
      setMessage(`❌ ${result.error}`)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  async function handleRemoveDiscount() {
    if (!removeDiscountModal.product) return
    const result = await removeDiscount(removeDiscountModal.product.id)
    if (result.success) {
      setMessage('✅ تم إزالة التخفيض واستعادة السعر الأصلي')
      setRemoveDiscountModal({ open: false, product: null })
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleToggleNew(id: string) {
    const result = await toggleNewTag(id)
    if (result.success) {
      setMessage(result.isNew ? '⭐ تم وسم المنتج كجديد' : 'تم إزالة وسم الجديد')
      loadProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const ColorCheckboxGroup = ({
    label,
    options,
    selected,
    onToggle,
    allowCustom = false,
  }: {
    label: string
    options: string[]
    selected: string[]
    onToggle: (val: string) => void
    allowCustom?: boolean
  }) => (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-charcoal">{label}</label>
        {allowCustom && (
          <button
            type="button"
            onClick={openCustomColorModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream border border-beige text-xs text-charcoal hover:border-gold/40 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-gold" />
            لون مخصص
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          const swatch = allColorSwatches[opt]
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all min-h-[44px]',
                isSelected
                  ? 'bg-gold/10 border-gold text-charcoal shadow-sm'
                  : 'bg-white border-beige text-charcoal/60 hover:border-gold/40'
              )}
            >
              {swatch && (
                <span
                  className="w-4 h-4 rounded-full border border-beige shrink-0"
                  style={{
                    backgroundColor: swatch,
                    borderColor: opt === 'أبيض' ? '#d1d5db' : undefined,
                  }}
                />
              )}
              <span>{opt}</span>
              {isSelected && <X className="w-3 h-3 text-gold" />}
            </button>
          )
        })}

        {customColors
          .filter((c) => !options.includes(c.name))
          .map((c) => {
            const isSelected = selected.includes(c.name)
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onToggle(c.name)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all min-h-[44px]',
                  isSelected
                    ? 'bg-gold/10 border-gold text-charcoal shadow-sm'
                    : 'bg-white border-beige text-charcoal/60 hover:border-gold/40'
                )}
              >
                <span
                  className="w-4 h-4 rounded-full border border-beige shrink-0"
                  style={{ backgroundColor: c.value }}
                />
                <span>{c.name}</span>
                {isSelected ? (
                  <X className="w-3 h-3 text-gold" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCustomColor(c.name)
                    }}
                    className="mr-1 text-warm-gray hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            )
          })}
      </div>
    </div>
  )

  const CheckboxGroup = ({
    label, options, selected, onToggle, type = 'color',
  }: {
    label: string
    options: string[]
    selected: string[]
    onToggle: (val: string) => void
    type?: 'color' | 'size' | 'tag'
  }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-charcoal mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          const swatch = allColorSwatches[opt]
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all min-h-[44px]',
                isSelected
                  ? 'bg-gold/10 border-gold text-charcoal shadow-sm'
                  : 'bg-white border-beige text-charcoal/60 hover:border-gold/40'
              )}
            >
              {type === 'color' && swatch && (
                <span
                  className="w-4 h-4 rounded-full border border-beige shrink-0"
                  style={{ backgroundColor: swatch, borderColor: opt === 'أبيض' ? '#d1d5db' : undefined }}
                />
              )}
              {type === 'tag' && (
                <span className={cn('w-2 h-2 rounded-full shrink-0', opt === 'جديد' ? 'bg-gold' : 'bg-rose')} />
              )}
              <span>{opt}</span>
              {isSelected && <X className="w-3 h-3 text-gold" />}
            </button>
          )
        })}
      </div>
    </div>
  )

  const ProductCard = ({ product }: { product: Product }) => {
    const hasDiscount = product.oldPrice && product.oldPrice > product.price
    const discountPercent = hasDiscount ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100) : 0
    const isMenuOpen = activeProductMenu === product.id

    return (
      <div className="bg-white rounded-2xl border border-beige/50 p-4 shadow-sm relative">
        <div className="flex gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-rose-light shrink-0">
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
            {hasDiscount && (
              <div className="absolute top-0 left-0 bg-rose text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                -{discountPercent}%
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-charcoal text-sm truncate">{product.name}</h3>
                <p className="text-xs text-warm-gray mt-0.5">{product.category}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveProductMenu(isMenuOpen ? null : product.id)
                }}
                className="p-1.5 rounded-lg hover:bg-cream transition-colors shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-charcoal" />
              </button>
            </div>

            <div className="flex items-end justify-between mt-2">
              <div>
                <span className="font-bold text-charcoal">{product.price} د.ل</span>
                {hasDiscount && (
                  <span className="text-xs text-warm-gray line-through block">{product.oldPrice} د.ل</span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      tag === 'جديد' ? 'bg-gold/10 text-gold' : 'bg-rose text-charcoal'
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute left-4 top-14 z-20 bg-white rounded-xl shadow-xl border border-beige p-2 w-44 animate-scale-in">
            <button
              onClick={() => { setEditingProduct(product); initEditForm(product); setActiveProductMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 text-gold" /> تعديل
            </button>
            <Link
              href={`/product/${product.id}`}
              target="_blank"
              onClick={() => setActiveProductMenu(null)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gold" /> عرض المنتج
            </Link>
            {hasDiscount ? (
              <button
                onClick={() => { setRemoveDiscountModal({ open: true, product }); setActiveProductMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors"
              >
                <Percent className="w-4 h-4 text-red-500" /> إزالة خصم
              </button>
            ) : (
              <button
                onClick={() => { setDiscountModal({ open: true, product }); setNewDiscountPrice(''); setActiveProductMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors"
              >
                <Percent className="w-4 h-4 text-green-600" /> إضافة خصم
              </button>
            )}
            <button
              onClick={() => { handleToggleNew(product.id); setActiveProductMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors"
            >
              <Sparkles className={cn('w-4 h-4', product.tags.includes('جديد') ? 'text-red-500' : 'text-gold')} />
              {product.tags.includes('جديد') ? 'إزالة وسم جديد' : 'وسم كجديد'}
            </button>
            <div className="h-px bg-beige my-1" />
            <button
              onClick={() => { handleDelete(product.id); setActiveProductMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> حذف
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-8">
      {/* Top Bar */}
      <div className="bg-white border-b border-beige/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-gold" />
              </div>
              <div>
                <h1 className="font-bold text-charcoal text-xs md:text-sm">لوحة التحكم</h1>
                <p className="text-[10px] md:text-xs text-gold">صالة العرض - ليبيا</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-charcoal/70 hover:text-charcoal hover:bg-cream rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                عرض الموقع
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Message */}
        {message && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium animate-fade-in">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'products' as Tab, label: 'المنتجات', icon: Package },
            { id: 'add' as Tab, label: 'إضافة منتج', icon: Plus },
            { id: 'categories' as Tab, label: 'تخصيص الفئات', icon: Layers },
            { id: 'stats' as Tab, label: 'الإحصائيات', icon: TrendingDown },
            { id: 'contact' as Tab, label: 'معلومات التواصل', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingProduct(null); if (tab.id !== 'add') resetWizard() }}
              className={cn(
                'flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px]',
                activeTab === tab.id
                  ? 'bg-gold text-white shadow-lg shadow-gold/20'
                  : 'bg-white text-charcoal/70 hover:text-charcoal border border-beige hover:border-gold/30'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── PRODUCTS TAB ─── */}
        {activeTab === 'products' && (
          <div>
            {editingProduct ? (
              <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-2 rounded-lg hover:bg-cream transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-charcoal" />
                  </button>
                  <h2 className="text-lg md:text-xl font-bold text-charcoal">تعديل المنتج</h2>
                </div>
                <div className="max-w-3xl space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">اسم المنتج</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">الفئة</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value, colors: [], sizes: [] })}
                        className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                      >
                        {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-charcoal mb-2">السعر (د.ل)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">الوصف</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">صور المنتج</label>
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all border-beige bg-cream hover:border-gold/40 mb-4"
                    >
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleEditImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 text-gold mx-auto mb-2" />
                      <p className="text-xs text-warm-gray">اضغطي لإضافة صور جديدة</p>
                    </div>
                    {editForm.images.length > 0 && (
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
                        {editForm.images.map((img, index) => (
                          <div key={index} className="relative aspect-square sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-beige bg-rose-light">
                            <Image src={img} alt={`صورة ${index + 1}`} fill className="object-cover" sizes="96px" />
                            {index === 0 && (
                              <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gold text-white text-[10px] font-bold rounded">رئيسية</div>
                            )}
                            <button
                              onClick={() => removeEditImage(index)}
                              className="absolute top-1 left-1 w-6 h-6 rounded-full bg-charcoal/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {editForm.category !== 'عطور' && (
                    <ColorCheckboxGroup
                      label="الألوان المتوفرة"
                      options={editForm.category === 'ملابس نسائية' ? CLOTHES_COLORS : editForm.category === 'أحذية' ? SHOES_COLORS : CLOTHES_COLORS}
                      selected={editForm.colors}
                      onToggle={(v) => toggleEditArray('colors', v)}
                      allowCustom
                    />
                  )}
                  <CheckboxGroup
                    label={editForm.category === 'عطور' ? 'الأحجام المتوفرة' : editForm.category === 'أحذية' ? 'المقاسات المتوفرة' : 'المقاسات المتوفرة'}
                    options={editForm.category === 'ملابس نسائية' ? CLOTHES_SIZES : editForm.category === 'أحذية' ? SHOES_SIZES : editForm.category === 'عطور' ? ['30ml', '50ml', '100ml'] : CLOTHES_SIZES}
                    selected={editForm.sizes}
                    onToggle={(v) => toggleEditArray('sizes', v)}
                    type="size"
                  />
                  <CheckboxGroup label="الوسوم" options={TAG_OPTIONS} selected={editForm.tags} onToggle={(v) => toggleEditArray('tags', v)} type="tag" />
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleUpdateProduct}
                      className="flex-1 sm:flex-none px-6 py-3 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold transition-colors shadow-lg shadow-gold/20 min-h-[48px]"
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 sm:flex-none px-6 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4 md:mb-6">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في المنتجات..."
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-20 text-warm-gray">جاري التحميل...</div>
                ) : (
                  <>
                    <div className="md:hidden space-y-3">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-warm-gray bg-white rounded-2xl border border-beige/50">
                          لا توجد منتجات تطابق البحث
                        </div>
                      )}
                    </div>

                    <div className="hidden md:block bg-white rounded-2xl border border-beige/50 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-cream border-b border-beige">
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">المنتج</th>
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">الفئة</th>
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">السعر</th>
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">التخفيض</th>
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">الوسوم</th>
                              <th className="px-4 py-3 text-right font-semibold text-charcoal">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product) => {
                              const hasDiscount = product.oldPrice && product.oldPrice > product.price
                              const discountPercent = hasDiscount ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100) : 0
                              return (
                                <tr key={product.id} className="border-b border-beige/50 hover:bg-cream/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-rose-light shrink-0">
                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-charcoal">{product.name}</p>
                                        <p className="text-xs text-warm-gray">ID: {product.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-warm-gray">{product.category}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-charcoal">{product.price} د.ل</span>
                                      {hasDiscount && <span className="text-xs text-warm-gray line-through">{product.oldPrice} د.ل</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {hasDiscount ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-md bg-rose text-charcoal text-xs font-bold">خصم {discountPercent}%</span>
                                        <button
                                          onClick={() => setRemoveDiscountModal({ open: true, product })}
                                          className="p-1.5 rounded-lg hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors"
                                          title="إزالة التخفيض"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => { setDiscountModal({ open: true, product }); setNewDiscountPrice('') }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream border border-beige text-warm-gray hover:text-gold hover:border-gold/40 transition-colors text-xs"
                                        title="إضافة تخفيض"
                                      >
                                        <Percent className="w-3.5 h-3.5" />إضافة خصم
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1.5 flex-wrap">
                                      {product.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className={cn(
                                            'px-2 py-0.5 rounded text-xs font-medium',
                                            tag === 'جديد' ? 'bg-gold/10 text-gold' : 'bg-rose text-charcoal'
                                          )}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      <button
                                        onClick={() => handleToggleNew(product.id)}
                                        className={cn(
                                          'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                                          product.tags.includes('جديد')
                                            ? 'bg-warm-gray/10 text-warm-gray hover:bg-red-50 hover:text-red-500'
                                            : 'bg-gold/10 text-gold hover:bg-gold hover:text-white'
                                        )}
                                        title={product.tags.includes('جديد') ? 'إزالة وسم جديد' : 'إضافة وسم جديد'}
                                      >
                                        <Sparkles className="w-3 h-3 inline" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => { setEditingProduct(product); initEditForm(product); setActiveTab('products') }}
                                        className="p-1.5 rounded-lg hover:bg-gold/10 text-warm-gray hover:text-gold transition-colors"
                                        title="تعديل"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <Link
                                        href={`/product/${product.id}`}
                                        target="_blank"
                                        className="p-1.5 rounded-lg hover:bg-gold/10 text-warm-gray hover:text-gold transition-colors"
                                        title="عرض"
                                      >
                                        <ArrowLeft className="w-4 h-4" />
                                      </Link>
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors"
                                        title="حذف"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-warm-gray">لا توجد منتجات تطابق البحث</div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── ADD PRODUCT WIZARD ─── */}
        {activeTab === 'add' && !editingProduct && (
          <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm max-w-3xl">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className={cn('flex items-center gap-2', addStep >= 1 && 'text-gold')}>
                <div className={cn(
                  'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold',
                  addStep >= 1 ? 'bg-gold text-white' : 'bg-beige text-charcoal/50'
                )}>
                  1
                </div>
                <span className="text-xs md:text-sm font-medium">المعلومات الأساسية</span>
              </div>
              <div className="flex-1 h-px bg-beige" />
              <div className={cn('flex items-center gap-2', addStep >= 2 && 'text-gold')}>
                <div className={cn(
                  'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold',
                  addStep >= 2 ? 'bg-gold text-white' : 'bg-beige text-charcoal/50'
                )}>
                  2
                </div>
                <span className="text-xs md:text-sm font-medium">التفاصيل</span>
              </div>
            </div>

            {/* Step 1 */}
            {addStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg md:text-xl font-bold text-charcoal mb-2">المعلومات الأساسية</h2>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">اسم المنتج</label>
                  <input
                    value={wizardData.name}
                    onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                    placeholder="مثال: فستان سهرة أنيق"
                    className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">الفئة</label>
                  {categories.length > 0 && categories.length < 3 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {categories.map((cat: any) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, category: cat.name, colors: [], sizes: [] })}
                          className={cn(
                            'px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center min-h-[48px]',
                            wizardData.category === cat.name
                              ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20'
                              : 'bg-cream text-charcoal/70 border-beige hover:border-gold/40'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  ) : categories.length >= 3 ? (
                    <select
                      value={wizardData.category}
                      onChange={(e) => setWizardData({ ...wizardData, category: e.target.value, colors: [], sizes: [] })}
                      className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[48px]"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-warm-gray">لا توجد فئات مضافة. أضيفي فئة أولاً من "تخصيص الفئات".</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">السعر (د.ل)</label>
                  <input
                    type="number"
                    value={wizardData.price}
                    onChange={(e) => setWizardData({ ...wizardData, price: e.target.value })}
                    placeholder="مثال: 350"
                    className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setAddStep(2)}
                    disabled={!canGoToStep2}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors shadow-lg shadow-gold/20 min-h-[48px]"
                  >
                    التالي<ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {addStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg md:text-xl font-bold text-charcoal">تفاصيل المنتج</h2>
                  <span className="text-xs md:text-sm text-gold bg-gold/10 px-3 py-1 rounded-full">{wizardData.category}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">الوصف</label>
                  <textarea
                    value={wizardData.description}
                    onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                    placeholder="وصف تفصيلي للمنتج..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">صور المنتج</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all',
                      dragOver ? 'border-gold bg-gold/5' : 'border-beige bg-cream hover:border-gold/40'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-gold mx-auto mb-3" />
                    <p className="text-sm font-medium text-charcoal mb-1">اسحبي الصور هنا أو اضغطي للاختيار</p>
                    <p className="text-xs text-warm-gray">JPG, PNG, WebP — الحد الأقصى 5 ميجابايت</p>
                  </div>
                  {wizardData.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 mt-4">
                      {wizardData.images.map((img, index) => (
                        <div key={index} className="relative aspect-square sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-beige bg-rose-light">
                          {img.uploading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : img.url ? (
                            <>
                              <Image src={img.url} alt={`صورة ${index + 1}`} fill className="object-cover" sizes="96px" />
                              {index === 0 && (
                                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gold text-white text-[10px] font-bold rounded">
                                  رئيسية
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-red-400">
                              <X className="w-5 h-5" />
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-charcoal/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {wizardData.category !== 'عطور' && (
                  <ColorCheckboxGroup
                    label="الألوان المتوفرة"
                    options={wizardData.category === 'ملابس نسائية' ? CLOTHES_COLORS : wizardData.category === 'أحذية' ? SHOES_COLORS : CLOTHES_COLORS}
                    selected={wizardData.colors}
                    onToggle={(v) => toggleWizardArray('colors', v)}
                    allowCustom
                  />
                )}

                {wizardData.category === 'عطور' && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-charcoal mb-3">أحجام العبوة (ml)</label>
                    <div className="flex flex-wrap gap-2">
                      {['30ml', '50ml', '100ml'].map((size) => {
                        const isSelected = wizardData.sizes.includes(size)
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleWizardArray('sizes', size)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all min-h-[44px]',
                              isSelected ? 'bg-gold/10 border-gold text-charcoal shadow-sm' : 'bg-white border-beige text-charcoal/60 hover:border-gold/40'
                            )}
                          >
                            <span>{size}</span>
                            {isSelected && <X className="w-3 h-3 text-gold" />}
                          </button>
                        )
                      })}
                      {wizardData.sizes
                        .filter((s) => !['30ml', '50ml', '100ml'].includes(s))
                        .map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleWizardArray('sizes', size)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all bg-gold/10 border-gold text-charcoal shadow-sm min-h-[44px]"
                          >
                            <span>{size}</span>
                            <X className="w-3 h-3 text-gold" />
                          </button>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2 items-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={wizardData.customSize}
                        onChange={(e) => setWizardData({ ...wizardData, customSize: e.target.value })}
                        onKeyDown={handleCustomSizeKeyDown}
                        placeholder="مثال: 60"
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        disabled={!wizardData.customSize.trim()}
                        className="shrink-0 px-4 py-2.5 bg-gold hover:bg-gold-dark disabled:opacity-50 text-white rounded-xl font-medium transition-colors min-h-[44px] whitespace-nowrap"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                )}

                {wizardData.category === 'أحذية' && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-charcoal mb-3">المقاسات المتوفرة</label>
                    <div className="flex flex-wrap gap-2">
                      {SHOES_SIZES.map((size) => {
                        const isSelected = wizardData.sizes.includes(size)
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleWizardArray('sizes', size)}
                            className={cn(
                              'w-12 h-12 rounded-xl border text-sm font-medium transition-all flex items-center justify-center',
                              isSelected ? 'bg-gold/10 border-gold text-charcoal shadow-sm' : 'bg-white border-beige text-charcoal/60 hover:border-gold/40'
                            )}
                          >
                            {size}
                          </button>
                        )
                      })}
                      {wizardData.sizes
                        .filter((s) => !SHOES_SIZES.includes(s))
                        .map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleWizardArray('sizes', size)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all bg-gold/10 border-gold text-charcoal shadow-sm min-h-[44px]"
                          >
                            <span>{size}</span>
                            <X className="w-3 h-3 text-gold" />
                          </button>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2 items-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={wizardData.customSize}
                        onChange={(e) => setWizardData({ ...wizardData, customSize: e.target.value })}
                        onKeyDown={handleCustomSizeKeyDown}
                        placeholder="مثال: 44"
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        disabled={!wizardData.customSize.trim()}
                        className="shrink-0 px-4 py-2.5 bg-gold hover:bg-gold-dark disabled:opacity-50 text-white rounded-xl font-medium transition-colors min-h-[44px] whitespace-nowrap"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                )}

                {wizardData.category === 'ملابس نسائية' && (
                  <CheckboxGroup
                    label="المقاسات المتوفرة"
                    options={CLOTHES_SIZES}
                    selected={wizardData.sizes}
                    onToggle={(v) => toggleWizardArray('sizes', v)}
                    type="size"
                  />
                )}

                {wizardData.category !== 'عطور' && wizardData.category !== 'أحذية' && wizardData.category !== 'ملابس نسائية' && wizardData.category && (
                  <CheckboxGroup
                    label="المقاسات المتوفرة"
                    options={CLOTHES_SIZES}
                    selected={wizardData.sizes}
                    onToggle={(v) => toggleWizardArray('sizes', v)}
                    type="size"
                  />
                )}

                <CheckboxGroup label="الوسوم" options={TAG_OPTIONS} selected={wizardData.tags} onToggle={(v) => toggleWizardArray('tags', v)} type="tag" />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setAddStep(1)}
                    className="px-6 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
                  >
                    <ChevronRight className="w-5 h-5 inline ml-1" />السابق
                  </button>
                  <button
                    onClick={handleAddProductSubmit}
                    disabled={!wizardData.description || (wizardData.category !== 'عطور' && wizardData.colors.length === 0) || wizardData.sizes.length === 0}
                    className="flex-1 px-6 py-3 bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors shadow-lg shadow-gold/20 min-h-[48px]"
                  >
                    إضافة المنتج
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CATEGORIES TAB ─── */}
        {/* ─── CATEGORIES TAB ─── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-charcoal">الفئات</h2>
              <button
                onClick={() => openCategoryModal()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-xl font-semibold hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                إضافة فئة
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-beige/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream border-b border-beige">
                      <th className="px-4 py-3 text-right font-semibold text-charcoal">الفئة</th>
                      <th className="px-4 py-3 text-right font-semibold text-charcoal">الرابط</th>
                      <th className="px-4 py-3 text-right font-semibold text-charcoal">رئيسية</th>
                      <th className="px-4 py-3 text-right font-semibold text-charcoal">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat: any) => (
                      <tr key={cat.id} className="border-b border-beige/50 hover:bg-cream/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-rose-light shrink-0">
                              {cat.image ? (
                                <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="48px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-warm-gray text-center leading-tight p-1">
                                  لا توجد صورة
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-charcoal">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-warm-gray" dir="ltr">/{cat.slug}</td>
                        <td className="px-4 py-3">
                          {cat.is_main ? (
                            <span className="px-2 py-1 rounded-md bg-gold/10 text-gold text-xs font-bold">نعم</span>
                          ) : (
                            <span className="px-2 py-1 rounded-md bg-beige text-warm-gray text-xs">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openCategoryModal(cat)}
                              className="p-1.5 rounded-lg hover:bg-gold/10 text-warm-gray hover:text-gold transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                await handleDeleteCategory(cat)
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {categories.length === 0 && (
                <div className="text-center py-12 text-warm-gray">لا توجد فئات مضافة</div>
              )}
            </div>
          </div>
        )}

        {/* ─── STATS TAB ─── */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                </div>
                <span className="text-xs md:text-sm text-warm-gray">إجمالي المنتجات</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-charcoal">{totalProducts}</p>
            </div>
            <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-rose/50 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-charcoal" />
                </div>
                <span className="text-xs md:text-sm text-warm-gray">منتجات بتخفيض</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-charcoal">{totalDiscounts}</p>
            </div>
            <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                </div>
                <span className="text-xs md:text-sm text-warm-gray">منتجات جديدة</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-charcoal">{totalNew}</p>
            </div>
            <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-beige/50 flex items-center justify-center">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-charcoal" />
                </div>
                <span className="text-xs md:text-sm text-warm-gray">التصنيفات</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-charcoal">{categories.length}</p>
            </div>
            <div className="col-span-2 lg:col-span-4 bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-charcoal mb-4">توزيع المنتجات حسب الفئة</h3>
              <div className="space-y-3">
                {productCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length
                  const percent = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-charcoal">{cat}</span>
                        <span className="text-xs md:text-sm text-warm-gray">{count} منتج ({percent}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-cream overflow-hidden">
                        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── CONTACT INFO TAB ─── */}
        {activeTab === 'contact' && (
          <div className="max-w-3xl space-y-6">
            <form action={saveContact} className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-charcoal">معلومات التواصل</h2>
                  <p className="text-xs md:text-sm text-warm-gray">تعديل بيانات الفوتر وزر الواتساب</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">رقم الواتساب</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="whatsapp"
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                      placeholder="218945239468"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left dir-ltr"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[10px] text-warm-gray mt-1">بدون + وبدون مسافات — يستخدم في زر المنتج</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">رقم الهاتف (للعرض)</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+218 94-5239468"
                      dir="ltr"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="info@showroom.ly"
                      dir="ltr"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">العنوان</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="address"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      placeholder="طرابلس، ليبيا"
                      dir="rtl"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">رابط إنستغرام</label>
                  <div className="relative">
                    <Instagram className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="instagram"
                      value={contactInfo.instagram}
                      onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      dir="ltr"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">رابط فيسبوك</label>
                  <div className="relative">
                    <Facebook className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      name="facebook"
                      value={contactInfo.facebook}
                      onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      dir="ltr"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-charcoal mb-2">وصف الفوتر</label>
                <textarea
                  name="footerText"
                  value={contactInfo.footerText}
                  onChange={(e) => setContactInfo({ ...contactInfo, footerText: e.target.value })}
                  rows={3}
                  dir="rtl"
                  className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 resize-none text-right"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold transition-colors shadow-lg shadow-gold/20 min-h-[48px] flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  حفظ معلومات التواصل
                </button>
              </div>
            </form>

            <div className="bg-charcoal rounded-2xl p-4 md:p-6 text-white">
              <h3 className="text-sm font-semibold text-gold mb-4">معاينة الفوتر</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-90">
                <div>
                  <p className="text-xs text-white/60 mb-2 leading-relaxed">{contactInfo.footerText}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Instagram className="w-4 h-4" />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Facebook className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span className="text-white/60">{contactInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold" />
                    <span className="text-white/60" dir="ltr">{contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold" />
                    <span className="text-white/60">{contactInfo.email}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/40 flex justify-between">
                <span>© 2024 صالة العرض ليبيا</span>
                <span>الموقع للعرض فقط</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-beige/50 p-4 md:p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-charcoal mb-3">معاينة زر الواتساب</h3>
              <a
                href={`https://wa.me/${contactInfo.whatsapp}}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white rounded-xl font-semibold"
              >
                <Phone className="w-5 h-5" />
                <span>تواصلي عبر واتساب للاستفسار</span>
              </a>
              <p className="text-[10px] text-warm-gray mt-2 text-center">
                الرابط: wa.me/{contactInfo.whatsapp}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add Discount Modal ─── */}
      {discountModal.open && discountModal.product && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 md:p-6 w-full sm:max-w-md animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal">إضافة تخفيض</h3>
                <p className="text-sm text-warm-gray">{discountModal.product.name}</p>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-warm-gray">السعر الحالي</span>
                <span className="font-bold text-charcoal">{discountModal.product.price} د.ل</span>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-charcoal mb-2">السعر الجديد بعد التخفيض</label>
              <input
                type="number"
                value={newDiscountPrice}
                onChange={(e) => setNewDiscountPrice(e.target.value)}
                placeholder="أدخل السعر المخفض"
                className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
              />
              {newDiscountPrice && Number(newDiscountPrice) >= discountModal.product.price && (
                <p className="text-xs text-red-500 mt-1">السعر الجديد يجب أن يكون أقل من {discountModal.product.price} د.ل</p>
              )}
              {newDiscountPrice && Number(newDiscountPrice) > 0 && Number(newDiscountPrice) < discountModal.product.price && (
                <p className="text-xs text-green-600 mt-1">نسبة الخصم: {Math.round(((discountModal.product.price - Number(newDiscountPrice)) / discountModal.product.price) * 100)}%</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddDiscount}
                disabled={!newDiscountPrice || Number(newDiscountPrice) <= 0 || Number(newDiscountPrice) >= discountModal.product.price}
                className="flex-1 py-3 bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                تأكيد التخفيض
              </button>
              <button
                onClick={() => { setDiscountModal({ open: false, product: null }); setNewDiscountPrice('') }}
                className="flex-1 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Remove Discount Confirmation Modal ─── */}
      {removeDiscountModal.open && removeDiscountModal.product && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 md:p-6 w-full sm:max-w-md animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal">إزالة التخفيض</h3>
                <p className="text-sm text-warm-gray">{removeDiscountModal.product.name}</p>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-4 mb-5">
              <p className="text-sm text-charcoal mb-2">سيتم:</p>
              <ul className="space-y-1 text-sm text-warm-gray">
                <li>• استعادة السعر الأصلي: <span className="font-bold text-charcoal">{removeDiscountModal.product.oldPrice} د.ل</span></li>
                <li>• إلغاء السعر المخفض: <span className="font-bold text-charcoal">{removeDiscountModal.product.price} د.ل</span></li>
                <li>• إزالة وسم التخفيض</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRemoveDiscount}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                نعم، إزالة التخفيض
              </button>
              <button
                onClick={() => setRemoveDiscountModal({ open: false, product: null })}
                className="flex-1 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Custom Color Modal ─── */}
      {customColorModal.open && (
        <CustomColorPickerModal
          onAdd={addCustomColor}
          onClose={() => setCustomColorModal({ open: false })}
        />
      )}

      {/* ─── Category Modal ─── */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 md:p-6 w-full sm:max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-charcoal mb-5">
              {categoryModal.editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">اسم الفئة</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: ملابس نسائية"
                  className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px]"
                />
              </div>

              {categoryModal.editingId && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">الرابط (slug)</label>
                  <input
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="مثال: clothes"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-cream border border-beige focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 min-h-[44px] text-left"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">صورة الفئة</label>
                <div
                  onDragOver={handleCatDragOver}
                  onDragLeave={handleCatDragLeave}
                  onDrop={handleCatDrop}
                  onClick={() => catFileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
                    catDragOver ? 'border-gold bg-gold/5' : 'border-beige bg-cream hover:border-gold/40'
                  )}
                >
                  <input
                    ref={catFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCategoryImageUpload(e.target.files)}
                    className="hidden"
                  />
                  {categoryImageUpload?.url && !categoryImageUpload.uploading ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <Image src={categoryImageUpload.url} alt="Category" fill className="object-cover rounded-xl" sizes="128px" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setCategoryImageUpload(null); setCategoryForm(prev => ({ ...prev, image: '' })) }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : categoryImageUpload?.uploading ? (
                    <div className="w-full flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
                      <p className="text-sm font-medium text-charcoal mb-1">اسحبي الصورة هنا أو اضغطي للاختيار</p>
                      <p className="text-xs text-warm-gray">JPG, PNG, WebP</p>
                    </>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-cream border border-beige cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoryForm.isMain}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, isMain: e.target.checked }))}
                  className="w-5 h-5 rounded border-beige text-gold focus:ring-gold"
                />
                <span className="text-sm font-medium text-charcoal">فئة رئيسية (تظهر في القائمة)</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={submitCategoryModal}
                disabled={!categoryForm.name.trim()}
                className="flex-1 py-3 bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                {categoryModal.editingId ? 'حفظ التعديلات' : 'إضافة الفئة'}
              </button>
              <button
                onClick={closeCategoryModal}
                className="flex-1 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Category Cascade Confirmation ─── */}
      {deleteCatModal.open && deleteCatModal.cat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 md:p-6 w-full sm:max-w-md animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal">تنبيه: حذف الفئة</h3>
                <p className="text-sm text-warm-gray">{deleteCatModal.cat.name}</p>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-4 mb-5">
              <p className="text-sm text-charcoal mb-2">
                هناك <span className="font-bold text-red-600">{deleteCatModal.count} منتجات</span> مرتبطة بهذه الفئة.
              </p>
              <p className="text-sm text-warm-gray">
                إذا واصلت، سيتم <span className="font-bold text-charcoal">حذف الفئة وحذف جميع المنتجات داخلها نهائياً</span> بما في ذلك صورها.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmDeleteCategoryCascade}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                نعم، احذف الفئة والمنتجات ({deleteCatModal.count})
              </button>
              <button
                onClick={() => setDeleteCatModal({ open: false, cat: null, count: 0 })}
                className="flex-1 py-3 bg-beige hover:bg-sand text-charcoal rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}