import { AirdropForm } from "@/components/airdrop-form";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="w-full min-w-[96px] max-w-2xl px-4 sm:px-6">
          <h1 className="mb-8 text-4xl font-bold">
            Airdrop Tokens
          </h1>
          <AirdropForm />
        </div>
      </main>
    </div>
  );
}
