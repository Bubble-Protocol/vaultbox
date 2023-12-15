// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { Button } from "../../components/Button/Button";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { stateManager } from "../../../state-context";

export const CreateVault = () => {

  const navigate = useNavigate();
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal();
  const { createVault } = stateManager.useStateData('vault-functions')();

  function create() {
    
  }

  return (
    <div className="page">
      <div className="title">Create Your Vault</div>
      <div className="description">
        Your vault is protected by a smart contract controlled only by you and is encrypted using your wallet key. 
        A blockchain transaction is needed to create your vault.
      </div>
      {isConnected && <Button title="Create" onClick={createVault} />}
      {!isConnected && <Button title="Connect Wallet" onClick={openConnectModal} />}
    </div>
  );
};

