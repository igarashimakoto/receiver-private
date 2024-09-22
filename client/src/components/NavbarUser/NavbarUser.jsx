import React, { useState } from "react";
import { FaHome, FaSignOutAlt, FaCalendar } from "react-icons/fa";
import "./NavbarUser.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <h1 className="logo-text">Receiver</h1>
      </div>
      <ul className="menu">
        <li>
          <a href="/main">
            <FaHome />
            {!collapsed && <span>Home</span>}
          </a>
        </li>
     
        <li>
          <a href="/schedulesUser">
            <FaCalendar />
            {!collapsed && <span>Marcar entrega</span>}
          </a>
        </li>

        <li>
          <a href="/logout">
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </a>
        </li>
      </ul>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {collapsed ? '↓' : '↑'}
      </button>
    </div>
  );
};

export default Sidebar;
