import { create } from "zustand";

import { UserType } from "@/types/user";

type UserStoreType = {
  isLoggedIn: boolean;
  user: null | UserType;
  token: string | null;
  login: (user: UserType, token: string) => void;
  logout: () => void;
  setUser: (user: UserType) => void;
};

const useUserStore = create<UserStoreType>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  login: (userData: UserType, token: string) =>
    set({ isLoggedIn: true, user: userData, token }),
  logout: () => {
    set({ isLoggedIn: false, user: null });
    if (typeof window !== "undefined") {
      window.location =
        process.env.NEXT_PUBLIC_ACCOUNTS_LOGIN_URL ??
        "https://accounts.vamaship.com/sign-in";
    }
  },
  setUser: (userData: UserType) => set({ isLoggedIn: true, user: userData }),
}));

export default useUserStore;
