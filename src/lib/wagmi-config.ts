'use client';

import { http, createConfig } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Simple wagmi config with injected connector only
// WalletConnect can be added later with proper Next.js webpack config
export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

export { base, mainnet };
