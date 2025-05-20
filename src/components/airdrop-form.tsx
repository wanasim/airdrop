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
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { erc20Abi as abi, airdropAbi, chainsToAirdropERC20 } from "@/constants";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { formatEther } from "viem";

const formSchema = z.object({
  tokenAddress: z.string().min(42, "Token address must be 42 characters long"),
  recipients: z.string().min(42, "Recipients are required"),
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
  const { data: hash, writeContractAsync: approve, isPending } = useWriteContract();
  const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt(
    {
      confirmations: 1,
      hash: hash as `0x${string}`,
    },
  );
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account.address) {
      toast.error("Please connect your wallet first!");
      return;
    }
    const airdropAddress = (
      chainsToAirdropERC20[chainId] as {
        airdropERC20: string;
      }
    ).airdropERC20 as `0x${string}`;

    const approvedAmount = await getApprovedAmount({
      tokenAddress: values.tokenAddress as `0x${string}`,
      ownerAddress: account.address as `0x${string}`,
      airdropAddress,
      config,
    });
    const totalAmount = values.amount.split(",").reduce((total, num) => total + Number(num), 0);
    console.log("totalAmount", totalAmount);
    try {
      if (Number(formatEther(approvedAmount)) < totalAmount) {
        const approvalHash = await approve({
          abi,
          address: values.tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [airdropAddress, totalAmount],
        });

        await waitForTransactionReceipt(config, { hash: approvalHash as `0x${string}` });

        toast.success("Successfully approved token allowances!", {
          description: `You have approved ${totalAmount} tokens to the airdrop contract.`,
        });
      }
      await approve({
        abi: airdropAbi,
        address: airdropAddress,
        functionName: "airdropERC20",
        args: [
          values.tokenAddress,
          values.recipients.split(",").map((recipient) => recipient.trim()),
          values.amount.split(",").map(Number),
          totalAmount,
        ],
      });

      toast.success("Successfully airdropped tokens!", {
        description: `You airdropped ${totalAmount} tokens to the following recipients:\n${values.recipients.split(",").join("\n")}`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      mainForm.reset();
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
          },
        )}
        className="space-y-8"
      >
        <FormField
          control={mainForm.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={
                  mainForm.formState.errors.tokenAddress ? "text-red-500" : "text-gray-200"
                }
              >
                Token Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="0x..."
                  {...field}
                  className={`bg-gray-100 text-gray-900 placeholder:text-gray-500 ${mainForm.formState.errors.tokenAddress ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-gray-400"}`}
                />
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
              <FormLabel
                className={mainForm.formState.errors.recipients ? "text-red-500" : "text-gray-200"}
              >
                Recipients
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter recipient addresses (one per line)"
                  {...field}
                  className={`bg-gray-100 text-gray-900 placeholder:text-gray-500 ${mainForm.formState.errors.recipients ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-gray-400"}`}
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
              <FormLabel
                className={mainForm.formState.errors.amount ? "text-red-500" : "text-gray-200"}
              >
                Amount per Recipient
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter amounts separated by commas (e.g., 1.5, 2.0, 3.5)"
                  {...field}
                  className={`bg-gray-100 text-gray-900 placeholder:text-gray-500 ${mainForm.formState.errors.amount ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-gray-400"}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="bg-amber-500 text-white hover:cursor-pointer hover:bg-amber-600"
          variant="outline"
          type="submit"
          disabled={isPending || isReceiptLoading}
        >
          {isPending
            ? "Transaction Pending..."
            : isReceiptLoading
              ? "Confirming Transaction"
              : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
