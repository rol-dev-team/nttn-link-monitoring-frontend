// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const STORAGE_KEY = "myapp_auth"; // Namespaced key for localStorage
// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [auth, setAuth] = useState({ user: null, token: null });
//   const [loading, setLoading] = useState(true);

//   // Load auth from localStorage on mount.
//   useEffect(() => {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (raw) {
//       try {
//         const parsed = JSON.parse(raw);
//         if (parsed?.user && parsed?.token) {
//           setAuth(parsed);
//         }
//       } catch (err) {
//         console.warn("Malformed auth data in localStorage, ignoring.", err);
//       }
//     }
//     // Set loading to false after the initial check is complete
//     setLoading(false);
//   }, []);

//   // Persist auth to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
//   }, [auth]);

//   /**
//    * Log in user: store user and token.
//    * This assumes the user object returned from the backend's
//    * login endpoint already contains the roles.
//    * @param {object} user - user object returned from backend
//    * @param {string} token - API token
//    */
//   const login = (user, token) => {
//     setAuth({ user, token });
//   };

//   /**
//    * Log out user: clear user and token
//    */
//   const logout = () => {
//     setAuth({ user: null, token: null });
//   };

//   /**
//    * Memoized context value to avoid unnecessary re-renders
//    */
//   const value = useMemo(
//     () => ({
//       user: auth.user,
//       token: auth.token,
//       isAuthenticated: !!auth.user && !!auth.token,
//       loading,
//       login,
//       logout,
//     }),
//     [auth, loading]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// /**
//  * Custom hook to consume AuthContext
//  */
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
//   return ctx;
// }



//AUTH CONTEXT WITH AUTO LOG OUT

// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const STORAGE_KEY = "myapp_auth"; // Namespaced key for localStorage
// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [auth, setAuth] = useState({ user: null, token: null });
//   const [loading, setLoading] = useState(true);

//   // Load auth from localStorage on mount.
//   useEffect(() => {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (raw) {
//       try {
//         const parsed = JSON.parse(raw);
//         if (parsed?.user && parsed?.token) {
//           setAuth(parsed);
//         }
//       } catch (err) {
//         console.warn("Malformed auth data in localStorage, ignoring.", err);
//       }
//     }
//     // Set loading to false after the initial check is complete
//     setLoading(false);
//   }, []);

//   // Persist auth to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
//   }, [auth]);

//   // ── auto logout on 401 ---------------------------------
//   useEffect(() => {
//     const on401 = () => {
//       setAuth({ user: null, token: null }); // clear localStorage via the other effect
//       window.location.href = "/login";      // hard jump resets all react state
//     };
//     window.addEventListener("api:unauthorized", on401);
//     return () => window.removeEventListener("api:unauthorized", on401);
//   }, []);
//   // -------------------------------------------------------

//   /**
//    * Log in user: store user and token.
//    * This assumes the user object returned from the backend's
//    * login endpoint already contains the roles.
//    * @param {object} user - user object returned from backend
//    * @param {string} token - API token
//    */
//   const login = (user, token) => {
//     setAuth({ user, token });
//   };

//   /**
//    * Log out user: clear user and token
//    */
//   const logout = () => {
//     setAuth({ user: null, token: null });
//   };

//   /**
//    * Memoized context value to avoid unnecessary re-renders
//    */
//   const value = useMemo(
//     () => ({
//       user: auth.user,
//       token: auth.token,
//       isAuthenticated: !!auth.user && !!auth.token,
//       loading,
//       login,
//       logout,
//     }),
//     [auth, loading]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// /**
//  * Custom hook to consume AuthContext
//  */
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
//   return ctx;
// }

//AUTH CONTEXT WITH NO PAGE ELEMENTS REFRESH
// src/app/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "myapp_auth";
const MENU_KEY    = "myapp_menu";

const AuthContext = createContext(null);

/* 1️⃣  synchronous initialisers */
const getInitialAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);          // { user, token }
  } catch {}
  return { user: null, token: null };
};
const getInitialMenu = () => {
  try {
    return JSON.parse(localStorage.getItem(MENU_KEY) || "null");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth); // ← no flash
  const [menu, setMenu] = useState(getInitialMenu);
  const [loading, setLoading] = useState(false);    // nothing async left

  /* 2️⃣  persist changes */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  }, [menu]);

  /* 3️⃣  keep the 401 auto-logout */
  useEffect(() => {
    const on401 = () => {
      setAuth({ user: null, token: null });
      setMenu(null);
      window.location.href = "/login";
    };
    window.addEventListener("api:unauthorized", on401);
    return () => window.removeEventListener("api:unauthorized", on401);
  }, []);
  useEffect(() => {
    if (!auth.token) return;
    import("../services/authService")
      .then((mod) => mod.default.tokenCheck(auth.token))
      .catch(() => {}); // 401 already handled globally
  }, [auth.token]);

  /* 4️⃣  login: save auth + fire-and-forget menu fetch */
  const login = (user, token) => {
    setAuth({ user, token });
    import("../services/authService")
      .then((mod) => mod.default.listMenuPageElements(token))
      .then((rows) => setMenu(rows))
      .catch((e) => {
        console.warn("Could not fetch menu", e);
        setMenu(null);
      });
  };

  /* 5️⃣  logout: clear everything */
  const logout = () => {
    setAuth({ user: null, token: null });
    setMenu(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MENU_KEY);
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      menu,
      isAuthenticated: !!auth.user && !!auth.token,
      loading,
      login,
      logout,
    }),
    [auth, menu, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}