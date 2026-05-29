export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  is_main: boolean
  created_at?: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  oldPrice?: number
  description: string
  colors: string[]
  sizes: string[]
  images: string[]
  tags: string[]
}