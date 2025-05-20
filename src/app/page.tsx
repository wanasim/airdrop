import { AirdropForm } from "@/components/airdrop-form";

export default function Home() {
  return (
    <div className="min-h-screen gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-12">
      <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
        <div className="w-full min-w-[96px] max-w-2xl px-4 sm:px-6">
          <h1 className="mb-8 font-bold text-4xl">
            Airdrop Tokens
          </h1>
          <AirdropForm />
        </div>
      </main>
    </div>
  );
}
