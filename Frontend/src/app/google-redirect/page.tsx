"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { authClient } from "@/lib/auth";
import { gqlClient } from "@/lib/graphql/client";
import { ME } from "@/lib/graphql/query";
import { UserState } from "@/stores/types";
import { Loader } from "lucide-react";

export default function GoogleRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const redirect = searchParams.get("redirect") || "/dashboard";

    const init = async () => {
      let authToken: string | null = null;

      const { data, error } = await authClient.getSession({
        fetchOptions: {
          onSuccess: (ctx) => {
            authToken = ctx.response.headers.get("set-auth-token");
          },
        },
      });

      if (error || !data?.user) {
        router.replace("/signin");
        return;
      }

      try {
        const user = {
          ...data.user,
        };

        useAuth.setState({
          accessToken: authToken,
          refreshToken: null,
          isAuthenticated: true,
          user,
        });

        router.replace(redirect);
      } catch (err) {
        console.error(err);
        router.replace("/signin");
      }
    };

    init();
  }, [router, searchParams]);

  return <Loader className="animate-spin w-10 h-10 m-auto" />;
}
