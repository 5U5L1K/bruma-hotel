import { redirect } from "react-router-dom";
import { supabase } from "./supabaseClient";

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function rootLoader() {
  const session = await getCurrentSession();
  return { session };
}

export async function protectedLoader() {
  const session = await getCurrentSession();

  if (!session) {
    throw redirect("/login");
  }

  return { session };
}
