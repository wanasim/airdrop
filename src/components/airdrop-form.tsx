"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { formatEther, parseEther } from "viem";

function TokenBalance({
  tokenAddress,
  ownerAddress,
}: { tokenAddress: string; ownerAddress: `0x${string}` | undefined }) {
  const config = useConfig();
  const [balance, setBalance] = React.useState<string>("0");
  const [symbol, setSymbol] = React.useState<string>("");

  React.useEffect(() => {
    if (!tokenAddress || !ownerAddress) return;

    async function fetchBalance() {
      try {
        const balance = await readContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              inputs: [{ internalType: "address", name: "account", type: "address" }],
              name: "balanceOf",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "symbol",
              outputs: [{ internalType: "string", name: "", type: "string" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "balanceOf",
          args: [ownerAddress as `0x${string}`],
        });

        const tokenSymbol = await readContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              inputs: [],
              name: "symbol",
              outputs: [{ internalType: "string", name: "", type: "string" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "symbol",
        });

        setBalance(formatEther(balance as bigint));
        setSymbol(tokenSymbol as string);
      } catch (error) {
        console.error("Error fetching token balance:", error);
        setBalance("0");
        setSymbol("");
      }
    }

    fetchBalance();
  }, [tokenAddress, ownerAddress, config]);

  if (!tokenAddress || !ownerAddress) return null;

  return (
    <div className="mt-2 text-sm text-gray-400">
      Balance: {balance} {symbol}
    </div>
  );
}

function TransactionDetails({
  tokenAddress,
  amounts,
}: {
  tokenAddress: string;
  amounts: string;
}) {
  const config = useConfig();
  const [tokenName, setTokenName] = React.useState<string>("");
  const [totalWei, setTotalWei] = React.useState<bigint>(0n);

  React.useEffect(() => {
    if (!tokenAddress || !amounts) return;

    async function fetchTokenDetails() {
      try {
        const name = await readContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              inputs: [],
              name: "name",
              outputs: [{ internalType: "string", name: "", type: "string" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "name",
        });

        const amountList = amounts.split(",").map((amount) => amount.trim());
        const total = amountList.reduce((sum, amount) => {
          try {
            return sum + parseEther(amount);
          } catch {
            return sum;
          }
        }, 0n);

        setTokenName(name as string);
        setTotalWei(total);
      } catch (error) {
        console.error("Error fetching token details:", error);
        setTokenName("");
        setTotalWei(0n);
      }
    }

    fetchTokenDetails();
  }, [tokenAddress, amounts, config]);

  if (!tokenAddress || !amounts) return null;

  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Transaction Details</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Token Name:</span>
          <span className="text-gray-200">{tokenName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Amount (Wei):</span>
          <span className="text-gray-200">{totalWei.toString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Amount (Tokens):</span>
          <span className="text-gray-200">{formatEther(totalWei)}</span>
        </div>
      </div>
    </div>
  );
}

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

    // Convert amounts to wei (18 decimals)
    const amounts = values.amount.split(",").map((amount) => parseEther(amount.trim()));
    const totalAmount = amounts.reduce((total, amount) => total + amount, 0n);

    try {
      if (approvedAmount < totalAmount) {
        /** Approve the airdrop contract to spend the tokens */
        const approvalHash = await approve({
          abi,
          address: values.tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [airdropAddress, totalAmount],
        });

        /** Wait for the approval transaction to be confirmed */
        await waitForTransactionReceipt(config, { hash: approvalHash as `0x${string}` });

        toast.success("Successfully approved token allowances!", {
          description: `You have approved ${formatEther(totalAmount)} tokens to the airdrop contract.`,
        });
      }

      /** Approve the airdrop contract to spend the tokens and airdrop the tokens */
      const airdropHash = await approve({
        abi: airdropAbi,
        address: airdropAddress,
        functionName: "airdropERC20",
        args: [
          values.tokenAddress,
          values.recipients.split(/[,\n\s]+/).filter((recipient) => recipient.trim() !== ""),
          amounts,
          totalAmount,
        ],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: airdropHash as `0x${string}`,
      });

      if (receipt.status === "success") {
        toast.success("Successfully airdropped tokens!", {
          description: `You airdropped ${formatEther(totalAmount)} tokens to the following recipients:\n${values.recipients.split(",").join("\n")}`,
        });
      } else {
        toast.error("Airdrop transaction failed!");
      }
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
              <TokenBalance tokenAddress={field.value} ownerAddress={account.address} />
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
              <div className="text-sm text-gray-400 mt-1">
                Note: Amounts are in whole tokens (e.g., 1.5 = 1.5 tokens)
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <TransactionDetails
          tokenAddress={mainForm.watch("tokenAddress")}
          amounts={mainForm.watch("amount")}
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
