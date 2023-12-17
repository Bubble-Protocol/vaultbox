// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useEffect, useState } from "react";
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
  const vaultState = stateManager.useStateData('state')();
  const appError = stateManager.useStateData('error')();
  const { createVault } = stateManager.useStateData('vault-functions')();
  const [ creating, setCreating ] = useState(false);

  useEffect(() => {
    if (vaultState === 'initialised') navigate('/my-vault');
  }, [vaultState, navigate]);
  
  async function create() {
    setCreating(true);
    await createVault();
    setCreating(false);
    navigate('/create-vault');
  }

  return (
    <div className="create">
      <div className="title">Create Your Vault</div>
      <div className="description">
        Your vault is protected by a smart contract controlled only by you and is encrypted using your wallet key. 
        A blockchain transaction is needed to create your vault.
      </div>
      {!creating && isConnected && <Button title="Create" onClick={create} />}
      {!creating && !isConnected && <Button title="Connect Wallet" onClick={openConnectModal} />}
      {creating && <div className="loader" />}

      {/* Error log */}
      {appError && <span className='error-text'>{formatError(appError)}</span>}

    </div>
  );
};


function formatError(error) {
  return error.details || error.message || error;
}
