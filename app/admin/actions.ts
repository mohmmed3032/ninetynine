'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SignJWT, jwtVerify } from 'jose'
import { supabaseAdmin } from '@/lib/supabase'
import { Product } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-this-immediately'
)

export async function getCategoriesPublic() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getCategoriesPublic error:', error)
    return []
  }
  return data || []
}



async function verifyAdmin() {
  const token = cookies().get('admin_session')?.value
  if (!token) throw new Error('Unauthorized')
  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    cookies().delete('admin_session')
    throw new Error('Session expired')
  }
}

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/clothes')
  revalidatePath('/perfumes')
  revalidatePath('/shoes')
  revalidatePath('/offers')
  revalidatePath('/admin')
  revalidatePath('/category')
}

// ─── AUTH ───

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return { error: 'ADMIN_PASSWORD not set' }
  if (password !== adminPassword) return { error: 'Wrong password' }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET)

  cookies().set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  cookies().delete('admin_session')
  redirect('/admin/login')
}

// ─── PRODUCTS CRUD ───

export async function getAllProducts(): Promise<Product[]> {
  await verifyAdmin()
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

export async function getPublicProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPublicProducts error:', error)
    return []
  }
  return (data || []).map(rowToProduct)
}

// ─── IMAGE UPLOAD ───

export async function uploadImage(formData: FormData) {
  await verifyAdmin()

  const file = formData.get('image') as File
  if (!file) return { error: 'No file selected' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowed.includes(file.type)) return { error: 'Use JPG, PNG, or WebP' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Max 5MB' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  const filename = `${timestamp}-${random}.${ext}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: uploadError.message }
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename)

    return { success: true, url: urlData.publicUrl }
  } catch (e) {
    console.error('Upload exception:', e)
    return { error: 'Upload failed' }
  }
}

// ─── PRODUCT MUTATIONS ───

export async function addProduct(formData: FormData) {
  await verifyAdmin()

  const { data, error } = await supabaseAdmin.from('products').insert({
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    price: Number(formData.get('price')),
    old_price: formData.get('oldPrice') ? Number(formData.get('oldPrice')) : null,
    description: formData.get('description') as string,
    colors: parseArray(formData.get('colors') as string),
    sizes: parseArray(formData.get('sizes') as string),
    images: parseArray(formData.get('images') as string),
    tags: parseArray(formData.get('tags') as string),
  }).select().single()

  if (error) {
    console.error('addProduct error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true, product: rowToProduct(data) }
}

export async function updateProduct(id: string, formData: FormData) {
  await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      old_price: formData.get('oldPrice') ? Number(formData.get('oldPrice')) : null,
      description: formData.get('description') as string,
      colors: parseArray(formData.get('colors') as string),
      sizes: parseArray(formData.get('sizes') as string),
      images: parseArray(formData.get('images') as string),
      tags: parseArray(formData.get('tags') as string),
    })
    .eq('id', id)

  if (error) {
    console.error('updateProduct error:', error)
    return { error: error.message }
  }

  revalidateAll()
  revalidatePath(`/product/${id}`)
  return { success: true }
}

export async function deleteProduct(id: string) {
  await verifyAdmin()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  if (product?.images) {
    for (const url of product.images) {
      const filename = url.split('/').pop()
      if (filename) {
        await supabaseAdmin.storage
          .from('product-images')
          .remove([filename])
      }
    }
  }

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteProduct error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

export async function addDiscount(id: string, newPrice: number) {
  await verifyAdmin()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('price, tags')
    .eq('id', id)
    .single()

  if (!product) return { error: 'Not found' }
  if (newPrice >= product.price) return { error: 'New price must be lower' }

  const currentTags = product.tags || []
  const newTags = currentTags.includes('تخفيض')
    ? currentTags
    : [...currentTags, 'تخفيض']

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      old_price: product.price,
      price: newPrice,
      tags: newTags,
    })
    .eq('id', id)

  if (error) {
    console.error('addDiscount error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

export async function removeDiscount(id: string) {
  await verifyAdmin()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('old_price, tags')
    .eq('id', id)
    .single()

  if (!product) return { error: 'Not found' }

  const newTags = (product.tags || []).filter((t: string) => t !== 'تخفيض')

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      price: product.old_price,
      old_price: null,
      tags: newTags,
    })
    .eq('id', id)

  if (error) {
    console.error('removeDiscount error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

export async function toggleNewTag(id: string) {
  await verifyAdmin()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('tags')
    .eq('id', id)
    .single()

  if (!product) return { error: 'Not found' }

  const hasNew = (product.tags || []).includes('جديد')
  const newTags = hasNew
    ? (product.tags || []).filter((t: string) => t !== 'جديد')
    : [...(product.tags || []), 'جديد']

  const { error } = await supabaseAdmin
    .from('products')
    .update({ tags: newTags })
    .eq('id', id)

  if (error) {
    console.error('toggleNewTag error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true, isNew: !hasNew }
}

// ─── CATEGORIES CRUD ───

export async function getAllCategories() {
  await verifyAdmin()
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getAllCategories error:', error)
    return []
  }
  return data || []
}

export async function addCategory(formData: FormData) {
  await verifyAdmin()

  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const image = (formData.get('image') as string) || null
  const isMain = formData.get('isMain') === 'true'

  if (!name || !slug) return { error: 'Name and slug are required' }

  const { data, error } = await supabaseAdmin.from('categories').insert({
    name,
    slug,
    image,
    is_main: isMain,
  }).select().single()

  if (error) {
    console.error('addCategory error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true, category: data }
}

export async function updateCategory(id: string, formData: FormData) {
  await verifyAdmin()

  const { error } = await supabaseAdmin.from('categories').update({
    name: (formData.get('name') as string).trim(),
    slug: (formData.get('slug') as string).trim(),
    image: (formData.get('image') as string) || null,
    is_main: formData.get('isMain') === 'true',
  }).eq('id', id)

  if (error) {
    console.error('updateCategory error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

export async function deleteCategory(id: string) {
  await verifyAdmin()

  const { data: cat } = await supabaseAdmin
    .from('categories')
    .select('name')
    .eq('id', id)
    .single()

  if (cat?.name) {
    const { count } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat.name)

    if (count && count > 0) {
      return { error: `لا يمكن الحذف: يوجد ${count} منتجات مرتبطة بهذه الفئة. انقليها أو احذفيها أولاً.` }
    }
  }

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)

  if (error) {
    console.error('deleteCategory error:', error)
    return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

// ─── CONTACT SETTINGS ───

export async function saveContact(formData: FormData): Promise<void> {
  await verifyAdmin()

  const whatsapp = String(formData.get('whatsapp') || '')
  const phone = String(formData.get('phone') || '')
  const email = String(formData.get('email') || '')
  const address = String(formData.get('address') || '')
  const instagram = String(formData.get('instagram') || '')
  const facebook = String(formData.get('facebook') || '')
  const footerText = String(formData.get('footerText') || '')

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ id: 1, whatsapp, phone, email, address, instagram, facebook, footer_text: footerText })

  if (error) {
    console.error('saveContact error:', error)
    return
  }

  revalidateAll()
  return
}

// ─── HELPERS ───

function parseArray(value: string | null): string[] {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

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