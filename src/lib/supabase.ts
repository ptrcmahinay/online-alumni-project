import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function stub(): SupabaseClient {
  const noop = () => Promise.resolve({ data: null, error: null });
  const query: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") return undefined;
        if (prop === "select") return (_s?: any, o?: any) => {
          if (o?.count === "exact") return Promise.resolve({ data: null, count: 0, error: null });
          const inner: any = new Proxy({}, { get: () => inner });
          inner.then = (r: any) => r({ data: [], error: null });
          inner.single = () => Promise.resolve({ data: null, error: null });
          inner.order = (..._a: any) => inner;
          inner.not = (..._a: any) => inner;
          inner.eq = (..._a: any) => inner;
          inner.neq = (..._a: any) => inner;
          inner.limit = (..._a: any) => inner;
          return inner;
        };
        if (prop === "insert" || prop === "update" || prop === "delete" || prop === "upsert") {
          return () => {
            const i: any = new Proxy({}, { get: () => i });
            i.then = (r: any) => r({ data: null, error: null });
            i.select = () => i;
            i.single = () => Promise.resolve({ data: null, error: null });
            i.eq = () => i;
            return i;
          };
        }
        return query;
      },
    },
  );

  return new Proxy({} as SupabaseClient, {
    get(_t, prop) {
      if (prop === "from") return (_table: string) => query;
      if (prop === "auth") {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signUp: noop,
          signInWithPassword: noop,
          signOut: noop,
          resetPasswordForEmail: noop,
          updateUser: noop,
        };
      }
      if (prop === "storage") {
        return {
          from: () => ({
            upload: noop,
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
            remove: noop,
          }),
        };
      }
      if (prop === "channel") return () => ({ subscribe: () => {}, on: () => ({ subscribe: () => {} }) });
      if (prop === "realtime") return { channels: [] };
      return undefined;
    },
  });
}

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (console.warn("Missing Supabase env vars — running without backend"), stub());
