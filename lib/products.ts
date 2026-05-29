import { supabaseAdmin } from './supabase'
import { Product, Category } from '@/types'

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllProducts error:', error)
    return []
  }

  return (data || []).map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return rowToProduct(data)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProductsByCategory error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function getNewProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .contains('tags', ['جديد'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getNewProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function getDiscountedProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .contains('tags', ['تخفيض'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getDiscountedProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function getOffersProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .or('tags.cs.{"جديد"},tags.cs.{"تخفيض"}')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getOffersProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase()
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('searchProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function filterProducts(
  category?: string,
  sizes?: string[],
  colors?: string[],
  tag?: string,
  searchQuery?: string
): Promise<Product[]> {
  let query = supabaseAdmin.from('products').select('*')

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  if (category && category !== 'الكل') {
    query = query.eq('category', category)
  }

  if (sizes?.length) {
    query = query.overlaps('sizes', sizes)
  }

  if (colors?.length) {
    query = query.overlaps('colors', colors)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    console.error('filterProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

// Convert Supabase row to Product type
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price || undefined,
    description: row.description,
    colors: row.colors || [],
    sizes: row.sizes || [],
    images: row.images || [],
    tags: normalizeTags(row.tags),
  }
}

function normalizeTags(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const s = value.trim()
    if (!s) return []
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const parsed = JSON.parse(s)
        return Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        // fallthrough
      }
    }
    if (s.startsWith('{') && s.endsWith('}')) {
      return s.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean)
    }
    return s.split(',').map((x) => x.trim()).filter(Boolean)
  }
  try {
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getCategories error:', error)
    return []
  }
  return (data || []) as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return undefined
  return data as Category
}