/** @type {import('next').NextConfig} */
const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiBase}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
