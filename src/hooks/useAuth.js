import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = 还在加载，null = 未登录

  useEffect(() => {
    // 获取当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 监听登录/登出/token刷新
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return {
    user, // 用户对象，undefined=加载中，null=未登录
    loading: user === undefined, // 方便直接用
    isLoggedIn: !!user,
    signOut,
  };
}
