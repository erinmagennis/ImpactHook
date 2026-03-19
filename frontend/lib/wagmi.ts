import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, coinbaseWallet, injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { unichainSepolia } from "./chains";
import { sepolia } from "viem/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supported",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
  {
    appName: "ImpactHook",
    projectId: "impacthook-dev",
  }
);

export const config = createConfig({
  connectors,
  chains: [unichainSepolia, sepolia],
  transports: {
    [unichainSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
