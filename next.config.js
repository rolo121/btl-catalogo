/** @type {import('next').NextConfig} */

const normalizeBasePath = (value) => {
  const clean = String(value || '').trim()
  if (!clean || clean === '/') return ''
  return `/${clean.replace(/^\/+|\/+$/g, '')}`
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_APP_BASE_PATH)

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig = {
  basePath,
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Catálogo
      {
        source: '/shop/breadcrumb-img',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/shop/breadcrumb1',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/shop/sidebar-list',
        destination: '/productos',
        permanent: true,
      },

      // Producto viejo con query param: /product/default?id=MAK-1012

      // Páginas públicas
      {
        source: '/pages/about',
        destination: '/nosotros',
        permanent: true,
      },
      {
        source: '/pages/contact',
        destination: '/contacto',
        permanent: true,
      },
      {
        source: '/pages/faqs',
        destination: '/preguntas-frecuentes',
        permanent: true,
      },

      // Búsqueda
      {
        source: '/search-result',
        destination: '/buscar',
        permanent: true,
      },

      // Páginas funcionales
      {
        source: '/cart',
        destination: '/carrito',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/finalizar-compra',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/iniciar-sesion',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/registro',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/recuperar-contrasena',
        permanent: true,
      },
      {
        source: '/my-account',
        destination: '/mi-cuenta',
        permanent: true,
      },
      {
        source: '/wishlist',
        destination: '/favoritos',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/comparar',
        permanent: true,
      },
      {
        source: '/order-tracking',
        destination: '/seguimiento-pedido',
        permanent: true,
      },

      // Rutas heredadas del template
      {
        source: '/pages/store-list',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/pages/customer-feedbacks',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/coming-soon',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/page-not-found',
        destination: '/',
        permanent: true,
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.contenidopromo.com',
      },
      {
        protocol: 'https',
        hostname: 'www.contenidopromo.co',
      },
      {
        protocol: 'https',
        hostname: 'www.promoopcioncolombia.co',
      },
      {
        protocol: 'https',
        hostname: 'imgresources.makito.es',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
};

module.exports = nextConfig;
