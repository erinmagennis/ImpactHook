import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { unichainSepolia } from "./chains";
import { sepolia } from "viem/chains";

export const config = getDefaultConfig({
  appName: "ImpactHook",
  projectId: "impacthook-dev", // WalletConnect project ID (get one at cloud.walletconnect.com for production)
  chains: [unichainSepolia, sepolia],
  ssr: true,
});
