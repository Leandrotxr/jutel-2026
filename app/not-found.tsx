import { BackLink } from "@/components/back-link";

export default function NotFound() {
  return (
    <div className="wonder-card p-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">
        Página não encontrada
      </h1>
      <div className="mt-4">
        <BackLink label="Home" />
      </div>
    </div>
  );
}
