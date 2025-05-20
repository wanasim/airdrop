"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { airdropTokens } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type Config,
  useAccount,
  useChainId,
  useConfig,
} from "wagmi";

import {
  erc20Abi as abi,
  chainsToAirdropERC20,
} from "@/constants";
import { readContract } from "@wagmi/core";
import { formatEther } from "viem";

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(42, "Token address must be 42 characters long"),
  recipients: z.string().min(1, "Recipients are required"),
  amount: z.string().min(1, "Amount is required"),
  chainId: z.number().default(1),
});

async function getApprovedAmount({
  tokenAddress,
  ownerAddress,
  airdropAddress,
  config,
}: {
  tokenAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  airdropAddress: `0x${string}`;
  config: Config;
}): Promise<bigint> {
  const approvedAmount = await readContract(config, {
    abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [ownerAddress, airdropAddress],
  });

  const balance = await readContract(config, {
    address: tokenAddress,
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [ownerAddress],
  });

  return approvedAmount as bigint;
}

export function AirdropForm() {
  const chainId = useChainId();
  const account = useAccount();
  const config = useConfig();
  const mainForm = useForm({
    // @ts-ignore - zodResolver ts issue @ https://github.com/colinhacks/zod/issues/3987
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: "",
      recipients: "",
      amount: "",
      chainId: chainId,
    },
  });

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {
    try {
      if (!account.address) {
        toast.error("Please connect your wallet first!");
        return;
      }

      const approvedAmount = await getApprovedAmount({
        tokenAddress: values.tokenAddress as `0x${string}`,
        ownerAddress: account.address as `0x${string}`,
        airdropAddress: chainsToAirdropERC20[chainId]
          .airdropERC20 as `0x${string}`,
        config,
      });

      if (approvedAmount < BigInt(values.amount)) {
        toast.error(
          `Insufficient allowance! You currently have ${formatEther(
            approvedAmount
          )}  allowance for this contract.`
        );
        return;
      }

      const result = await airdropTokens({
        ...values,
        chainId,
      });

      if (result.success) {
        toast.success("Airdrop submitted successfully!");
        mainForm.reset();
      } else {
        toast.error(
          result.error || "Something went wrong!"
        );
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    }
  }

  return (
    <Form {...mainForm}>
      <form
        onSubmit={mainForm.handleSubmit(
          (data) => {
            onSubmit(data);
          },
          (errors) => {
            console.error("Form validation failed", errors);
          }
        )}
        className="space-y-8"
      >
        <FormField
          control={mainForm.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Address</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={mainForm.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipients</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter recipient addresses (one per line)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={mainForm.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount per Recipient</FormLabel>
              <FormControl>
                <Input placeholder="0.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="bg-amber-500 text-white hover:bg-amber-600 hover:cursor-pointer"
          variant="outline"
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
