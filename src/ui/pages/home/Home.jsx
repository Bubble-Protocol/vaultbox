// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { Button } from "../../components/Button/Button";
import heroImage from "../../assets/hero-image.png";
import { stateManager } from "../../../state-context";

export const Home = () => {

  const navigate = useNavigate();
  const vaultState = stateManager.useStateData('state')();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="titles">
          <span className="title">Secure your <span className="title-highlight">files</span> in your personal encrypted <span className="title-highlight">vault</span></span>
          <span className="subtitle">Take control of your personal data in a vault secured by your web3 wallet.</span>
          {vaultState === 'initialised' && <Button title="Go To Your Vault" onClick={() => navigate('/create-vault')} />}
          {vaultState !== 'initialised' && <Button title="Create Your Vault" onClick={() => navigate('/create-vault')} />}
        </div>
        <img className="hero-image" src={heroImage}></img>
      </div>
    </div>
  );
};

