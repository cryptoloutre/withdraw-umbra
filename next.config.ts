import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
   rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off'
  },
}

export default nextConfig
