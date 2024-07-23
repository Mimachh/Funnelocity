import NextAuth from "next-auth";

import authConfig from "@/next-auth-config/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  adminRoutes,
  DEFAULT_FORBIDDEN_REDIRECT,
} from "@/next-auth-config/routes";
import { useCheckAdminRole } from "./hooks/use-check-admin-role";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;


  // const isAdmin = await useCheckAdminRole(req.auth?.user.roles);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith(adminRoutes);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (isAdminRoute) {
    // if (isLoggedIn && isAdmin) {
    //   return null;
    // } else if (isLoggedIn && !isAdmin) {
    //   return Response.redirect(new URL(DEFAULT_FORBIDDEN_REDIRECT, nextUrl));
    // }
    return null
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

  
    return Response.redirect(
      new URL(`/agency/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }


  const afterAuthResponse = await afterAuth(req.auth, req);
  if (afterAuthResponse) {
    return afterAuthResponse;
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};



const afterAuth = async (auth: any, req: any) => {
  const { nextUrl } = req;
  const url = nextUrl.clone();
  const searchParams = url.searchParams.toString();
  const hostname = req.headers.get("host");
  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // If subdomain exists
  const customSubDomain = hostname
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.redirect(new URL(`/agency/login`, req.url));
  }

  if (
    url.pathname === "/" ||
    (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }

  if (
    url.pathname.startsWith("/agency") ||
    url.pathname.startsWith("/subaccount")
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }

  return null;
};
