import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM Relayer SDK requires strict COOP and COEP headers for SharedArrayBuffer support
    // COOP: 'same-origin' is required for FHEVM threads to work
    // COEP: 'require-corp' is required for proper cross-origin isolation
    // Note: This may conflict with Base Account SDK, but FHEVM is the core functionality
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  },
  webpack: (config, { isServer }) => {
    // Ignore React Native modules that MetaMask SDK tries to import
    // These are not needed in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
      };
      
      // Ignore these modules in webpack
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
};

export default nextConfig;
