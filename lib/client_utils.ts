"use client";

import { UserType } from "@/types/user";
import { getUserDetails } from "./user";

export function getCookie(name: string) {
  if (typeof window !== "undefined") {
    const cookieArr = document?.cookie?.split(";") ?? [];
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");
      if (name == cookiePair[0].trim()) {
        return decodeURIComponent(cookiePair[1]);
      }
    }
  }
  return null;
}

export function verifyUserLogin(
  isLoggedIn: boolean,
  login: (userData: UserType) => void,
  logout: () => void,
) {
  if (!isLoggedIn) {
    const token = getCookie("token");
    if (token) {
      getUserDetails(token)
        .then((userDetails) => {
          if (userDetails?.data?.user) {
            login(userDetails.data.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        });
    } else {
      logout();
    }
  }
}
