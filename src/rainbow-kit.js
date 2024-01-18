// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { baseGoerli, polygon } from 'wagmi/chains';


/**
 * @dev Configuration of the RainbowKit wallet
 */

const WALLET_CONNECT_PROJECT_ID = 'YOUR_PROJECT_ID';

const { chains, publicClient } = configureChains(
  [baseGoerli, polygon],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Bubble Protocol Vault',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export const rainbowKitConfig = {
  wagmiConfig,
  chains
};