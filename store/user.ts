import { create } from "zustand";

import { UserType } from "@/types/user";

type UserStoreType = {
  isLoggedIn: boolean;
  user: null | UserType;
  login: (user: UserType) => void;
  logout: () => void;
  setUser: (user: UserType) => void;
};

const useUserStore = create<UserStoreType>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (userData: UserType) => set({ isLoggedIn: true, user: userData }),
  logout: () => {
    set({ isLoggedIn: false, user: null });
    if (typeof window !== "undefined") {
      window.location =
        process.env.ACCOUNTS_LOGIN_URL ??
        "https://accounts.vamaship.com/sign-in";
    }
  },
  setUser: (userData: UserType) => set({ isLoggedIn: true, user: userData }),
}));

export default useUserStore;
