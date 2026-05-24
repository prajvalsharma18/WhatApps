"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const user_service = "http://13.219.245.149:5000";
export const chat_service = "http://13.219.245.149:5002";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState(null);
  const [users, setUsers] = useState(null);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get(
        `${user_service}/api/v1/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data));
      setIsAuth(true);
      localStorage.setItem("isAuth", "true");
    } catch (error) {
      console.log(error);
      localStorage.removeItem("isAuth");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    localStorage.removeItem("isAuth");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuth(false);

    toast.success("User Logged Out");
  }

  async function fetchChats() {
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/chat/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats(data.chats);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchUsers() {
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(
        `${user_service}/api/v1/user/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const savedAuthState = localStorage.getItem("isAuth");
    if (savedAuthState === "true") {
      setIsAuth(true);
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.log("Failed to parse saved user data");
      }
    }

    fetchUser();
    fetchChats();
    fetchUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        logoutUser,
        fetchChats,
        fetchUsers,
        chats,
        users,
        setChats,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppData must be used within AppProvider"
    );
  }

  return context;
};