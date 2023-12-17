// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import './App.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Route, Routes, useNavigate } from "react-router-dom";
import { Home } from "./pages/home/Home";
import { MobileMenu } from "./components/MobileMenu/MobileMenu";
import { CreateVault } from "./pages/create";
import { MyVault } from "./pages/vault";


/**
 * @dev The main application screen
 */

function App() {

  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="App">

      {/* Mobile Menu */}
      <MobileMenu visible={menuVisible} onCompletion={() => setMenuVisible(false)} />

      {/* Header */}
      <div className="header">
        <div className="logo clickable" onClick={() => window.innerWidth >= 910 ? navigate('/') : setMenuVisible(!menuVisible)} ></div>
        <div className="expander mobile"></div>
        <div className="menubar no-mobile">
          <span className="header-link" onClick={() => navigate('/my-vault')}>My Vault</span>
          <span className="header-link" onClick={() => navigate('/prices')}>Prices</span>
        </div>
        <div className="right-menu">
          <ConnectButton className="test" showBalance={false} chainStatus={"icon"} accountStatus={{smallScreen: 'avatar', largeScreen: 'address'}} />
        </div>
      </div>

      {/* Content */}
        <Routes>
          <Route path='/create-vault' element={<CreateVault/>} />
          <Route path='/my-vault' element={<MyVault/>} />
          <Route path='/prices' element={<Home/>} />
          <Route path='*' element={<Home/>} />
        </Routes>
      </div>

  );

}

export default App;
