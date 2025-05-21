import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { anvil, baseSepolia, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Airdop",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [sepolia, anvil, baseSepolia],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string),
    [anvil.id]: http(process.env.NEXT_PUBLIC_ANVIL_RPC_URL as string),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL as string),
  },
  ssr: true,
});
