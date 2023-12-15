import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export const MobileMenu = ({visible, onCompletion}) => {

  const navigate = useNavigate();

  function go(urlStr) {
    navigate(urlStr);
    onCompletion();
  }

  return (
    <>
      <div className={"tinted-screen-overlay" + (visible ? '' : ' hide')} onClick={onCompletion}></div>
      <div className={"mobile-menu" + (visible ? ' visible' : '')}>
        <img className="logo clickable" src={logo} onClick={onCompletion} ></img>
        <div className="menu">
          <div className="menu-option" onClick={() => go('/vault')}>My Vault</div>
          <div className="menu-option" onClick={() => go('/pricing')}>Pricing</div>
        </div>
      </div>
    </>
  );
};

