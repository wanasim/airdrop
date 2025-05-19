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

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(42, "Token address must be 42 characters long"),
  recipients: z.string().min(1, "Recipients are required"),
  amount: z.string().min(1, "Amount is required"),
});

export function AirdropForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: "",
      recipients: "",
      amount: "",
    },
  });

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {
    try {
      const result = await airdropTokens(values);
      if (result.success) {
        toast.success("Airdrop submitted successfully!");
        form.reset();
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
        <Button variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
