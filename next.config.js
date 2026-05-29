/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'i.ibb.co'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'i.ibb.co', pathname: '/**' },
      { protocol: 'https', hostname: 'cmcbhqvfcqpakttwmxhu.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ]
  },
}

module.exports = nextConfig