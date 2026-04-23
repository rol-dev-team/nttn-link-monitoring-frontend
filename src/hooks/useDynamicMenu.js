// without order_id by asending
// import { useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import authService from "../services/authService";
// import { useAuth } from "../app/AuthContext";
// import { usePermissions } from "../hooks/usePermissions";

// const MENU_CACHE_KEY = "menu-page-elements:v2"; // bump cache key since schema changed

// const alpha = (a, b) => String(a.label).localeCompare(String(b.label));

// function buildMenuTreeFromElements(rows = []) {
//   const root = [];
//   const menus = new Map();       // menu_name -> node
//   const submenus = new Map();    // menu_name::sub_menu_name -> node
//   const seen = new Set();        // dedupe leaves by label|path

//   const ensureMenu = (menuLabel, menuIcon) => {
//     if (!menus.has(menuLabel)) {
//       const node = { label: menuLabel, icon: menuIcon || null, children: [] };
//       menus.set(menuLabel, node);
//       root.push(node);
//     } else if (menuIcon && !menus.get(menuLabel).icon) {
//       // fill icon if it arrives from a later row
//       menus.get(menuLabel).icon = menuIcon;
//     }
//     return menus.get(menuLabel);
//   };

//   const ensureSubmenu = (menuLabel, menuIcon, subLabel, subIcon) => {
//     const parent = ensureMenu(menuLabel, menuIcon);
//     const key = `${menuLabel}::${subLabel}`;
//     if (!submenus.has(key)) {
//       const node = { label: subLabel, icon: subIcon || null, children: [] };
//       submenus.set(key, node);
//       parent.children.push(node);
//     } else if (subIcon && !submenus.get(key).icon) {
//       submenus.get(key).icon = subIcon;
//     }
//     return submenus.get(key);
//   };

//   const pushLeaf = (targetChildren, label, path, icon) => {
//     const sig = `${label}|${path}`;
//     if (seen.has(sig)) return;
//     seen.add(sig);
//     targetChildren.push({ label, path, icon: icon || null });
//   };

//   rows.forEach((r) => {
//     // filter inactive (status === 0)
//     if (Number(r?.status) === 0) return;

//     const pageLabel = r.page_name || "Untitled";
//     const path = r.path || "#";
//     const menuLabel = r.menu_name || null;
//     const subLabel = r.sub_menu_name || null;

//     const menuIcon = r.menu_icon || null;
//     const subIcon = r.sub_menu_icon || null;
//     const pageIcon = r.page_icon || null;

//     if (!menuLabel && !subLabel) {
//       // top-level page
//       pushLeaf(root, pageLabel, path, pageIcon);
//       return;
//     }
//     if (menuLabel && !subLabel) {
//       const menuNode = ensureMenu(menuLabel, menuIcon);
//       pushLeaf(menuNode.children, pageLabel, path, pageIcon);
//       return;
//     }
//     // menu + submenu
//     const subNode = ensureSubmenu(menuLabel, menuIcon, subLabel, subIcon);
//     pushLeaf(subNode.children, pageLabel, path, pageIcon);
//   });

//   // sort
//   root.sort(alpha);
//   root.forEach((n) => {
//     if (Array.isArray(n.children)) {
//       n.children.sort(alpha);
//       n.children.forEach((c) => {
//         if (Array.isArray(c.children)) c.children.sort(alpha);
//       });
//     }
//   });

//   return root;
// }

// export function useDynamicMenu() {
//   const { menu: rows, token } = useAuth();   // ← read cached rows
//   const { hasPermission } = usePermissions();

//   const tree = useMemo(() => {
//     if (!token || !hasPermission("menu-page-elements.index")) return [];
//     return buildMenuTreeFromElements(rows || []);
//   }, [rows, token, hasPermission]);

//   return { tree, isLoading: false, isFetching: false, isError: false, error: null };
// }

// with order_id by asending
import { useMemo } from 'react';
import { useAuth } from '../app/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

function buildMenuTreeFromElements(rows = []) {
  if (!rows || !rows.length) return [];

  // Group by menu_id first
  const menuMap = new Map();

  // First, create all menus and submenus
  rows.forEach((item) => {
    if (Number(item?.status) === 0) return;

    const menuId = item.menu_id;
    if (!menuId) return;

    if (!menuMap.has(menuId)) {
      menuMap.set(menuId, {
        label: item.menu_name,
        icon: item.menu_icon,
        children: [],
        order_id: 9999,
      });
    }

    const menu = menuMap.get(menuId);

    // Update order if available
    if (item.order_id !== null && item.order_id !== undefined) {
      menu.order_id = Math.min(menu.order_id, item.order_id);
    }

    // Handle submenus
    if (item.sub_menu_id && item.sub_menu_name) {
      let subMenu = menu.children.find((child) => child.label === item.sub_menu_name);

      if (!subMenu) {
        subMenu = {
          label: item.sub_menu_name,
          icon: item.sub_menu_icon,
          children: [],
          order_id: 9999,
        };
        menu.children.push(subMenu);
      }

      // Add page to submenu
      subMenu.children.push({
        label: item.page_name,
        path: item.path?.replace(/\\/g, '') || '#',
        icon: item.page_icon,
        order_id: item.order_id,
      });
    } else {
      // Direct page in menu
      menu.children.push({
        label: item.page_name,
        path: item.path?.replace(/\\/g, '') || '#',
        icon: item.page_icon,
        order_id: item.order_id,
      });
    }
  });

  // Convert to array and sort
  const result = Array.from(menuMap.values());

  result.sort((a, b) => (a.order_id || 9999) - (b.order_id || 9999));

  result.forEach((menu) => {
    menu.children.sort((a, b) => (a.order_id || 9999) - (b.order_id || 9999));

    menu.children.forEach((child) => {
      if (child.children) {
        child.children.sort((a, b) => (a.order_id || 9999) - (b.order_id || 9999));
      }
    });
  });

  return result;
}

export function useDynamicMenu() {
  const { menu: rows, token } = useAuth();
  const { hasPermission } = usePermissions();
  console.log('useDynamicMenu', rows);
  const tree = useMemo(() => {
    if (!token) {
      console.log('No token available');
      return [];
    }

    if (!hasPermission('menu-page-elements.index')) {
      console.log('No permission for menu');
      return [];
    }

    if (!rows || !rows.length) {
      console.log('No menu data available');
      return [];
    }

    return buildMenuTreeFromElements(rows);
  }, [rows, token, hasPermission]);

  return {
    tree,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  };
}
