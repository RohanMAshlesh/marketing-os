"use client";

import { useCallback, useEffect, useState } from "react";
import { Role } from "./types";

const KEY = "mos_role";
const EVENT = "mos-role-change";

function readRole(): Role {
  if (typeof window === "undefined") return "manager";
  return (window.localStorage.getItem(KEY) as Role) || "manager";
}

export function useRole(): [Role, (r: Role) => void] {
  const [role, setRoleState] = useState<Role>("manager");

  useEffect(() => {
    setRoleState(readRole());
    const onChange = () => setRoleState(readRole());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setRole = useCallback((r: Role) => {
    window.localStorage.setItem(KEY, r);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [role, setRole];
}
