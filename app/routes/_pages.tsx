import { Link, Outlet } from "@remix-run/react";
import React from "react";

export default function Pages() {
  return (
    <div className="drawer drawer-mobile drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
        <ul className="menu pt-2 w-80 bg-base-100 text-base-content">
          <li className="mb-1">
            <Link to="/">Home</Link>
          </li>
          <li className="mb-1">
            <Link to="/example">Example</Link>
          </li>
          <li className="mb-1">
            <Link to="/example2">Example 2</Link>
          </li>
        </ul>
      </div>
      <div className="drawer-content flex flex-col">
        <main className="flex-1 overflow-y-auto pt-8 px-6 bg-base-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
