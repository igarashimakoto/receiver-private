import React, { useState } from "react";
import { FaHome, FaSignOutAlt, FaCalendar } from "react-icons/fa";
import "./Navbar.css";
import {jwtDecode} from 'jwt-decode';

const token = localStorage.getItem('token');
const type = jwtDecode(token).type;

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
          <a href="/home">
            <FaHome />
            {!collapsed && <span>Home</span>}
          </a>
        </li>
        {type === 3 && (        
        <li>
          <a href="/schedulesEnterprise">
            <FaCalendar />
            {!collapsed && <span>Dias para entregas</span>}
          </a>
        </li>)}

        {type === 2 && (
        <li>
        <a href="/">
          <FaCalendar />
          {!collapsed && <span>Marcar Entregas</span>}
        </a>
      </li>)}

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
