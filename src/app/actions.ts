"use server";

import { z } from "zod";
import { chainsToAirdropERC20 } from "@/constants";

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(42, "Token address must be 42 characters long"),
  recipients: z.string().min(1, "Recipients are required"),
  amount: z.string().min(1, "Amount is required"),
  chainId: z
    .number()
    .refine(
      (val) =>
        Object.keys(chainsToAirdropERC20).includes(
          val.toString()
        ),
      {
        message: "Invalid chain ID",
      }
    ),
});

export async function airdropTokens(
  data: z.infer<typeof formSchema>
) {
  try {
    // TODO: Implement token airdrop logic
    console.log("Airdropping tokens:", data);
    return { success: true };
  } catch (error) {
    console.error("Error airdropping tokens:", error);
    return {
      success: false,
      error: "Failed to airdrop tokens",
    };
  }
}
