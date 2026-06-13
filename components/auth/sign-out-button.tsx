import { signOut } from "@/app/login/actions";

type SignOutButtonProps = {
  inverted?: boolean;
};

export function SignOutButton({ inverted = false }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          inverted
            ? "rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            : "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        }
      >
        Sign out
      </button>
    </form>
  );
}
