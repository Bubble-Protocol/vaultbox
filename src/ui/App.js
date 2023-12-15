// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import './App.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Route, Routes, useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import { Home } from "./pages/home/Home";
import { useAccount } from "wagmi";
import { MobileMenu } from "./components/MobileMenu/MobileMenu";
import { CreateVault } from "./pages/create";
import { stateManager } from "../state-context";
import { MyVault } from "./pages/vault";


/**
 * @dev The main application screen
 */

function App() {

  const { isConnected } = useAccount()
  const [menuVisible, setMenuVisible] = useState(false);
  const vaultState = stateManager.useStateData('state')();
  const navigate = useNavigate();

  return (
    <div className="App">

      {/* Mobile Menu */}
      <MobileMenu visible={menuVisible} onCompletion={() => setMenuVisible(false)} />

      {/* Header */}
      <div className="header">
        <img className="logo clickable" src={logo} onClick={() => window.innerWidth >= 910 ? navigate('/') : setMenuVisible(!menuVisible)} ></img>
        <div className="menubar">
          <span className="header-link" onClick={() => navigate('/vault')}>My Vault</span>
          <span className="header-link" onClick={() => navigate('/prices')}>Prices</span>
        </div>
        <div className="right-menu">
          <ConnectButton className="test" showBalance={false} />
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        <Routes>
          <Route path='/create-vault' element={vaultState === 'initialised' ? <MyVault/> : <CreateVault/>} />
          <Route path='/vault' element={isConnected && vaultState === 'initialised' ? <MyVault/> : <CreateVault/>} />
          <Route path='/prices' element={<Home/>} />
          <Route path='*' element={<Home/>} />
        </Routes>
      </div>
    </div>

  );

}

export default App;
