import { handlers } from "@/core/lib/auth/auth"; // Referring to the auth.ts we just created

export const runtime = "nodejs";

export const { GET, POST } = handlers;
