import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, anvil } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Airdop",
  projectId: process.env
    .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [sepolia, anvil],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string
    ),
    [anvil.id]: http(
      process.env.NEXT_PUBLIC_ANVIL_RPC_URL as string
    ),
  },
  ssr: true,
});
