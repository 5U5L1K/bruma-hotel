import { useEffect, useState } from "react";
import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function App() {
  const loaderData = useLoaderData();
  const [session, setSession] = useState(loaderData.session ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session ?? null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!session && window.location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (session && window.location.pathname === "/login") {
    return <Navigate to="/clients" replace />;
  }

  return <Outlet />;
}
