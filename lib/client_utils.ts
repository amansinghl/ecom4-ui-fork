"use client";

import { UserType } from "@/types/user";
import { getCredits, getUserDetails } from "./user";

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

export async function refreshCreditBalance(
  token: null | string,
  user: UserType | null,
  login: (userdata: UserType, token: string) => void,
) {
  if (token && user) {
    const response = await getCredits(token);
    user.entity.credit_balance = response?.data?.creditDetails?.credit_balance;
    user.entity.credit_limit = response?.data?.creditDetails?.credit_limit;
    login(user, token);
  }
  return "00.00";
}

export function verifyUserLogin(
  isLoggedIn: boolean,
  login: (userData: UserType, token: string) => void,
  logout: () => void,
) {
  if (!isLoggedIn) {
    const token = getCookie("token");
    if (token) {
      getUserDetails(token)
        .then((userDetails) => {
          if (userDetails?.data?.user) {
            login(userDetails.data.user, token);
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
