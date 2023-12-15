// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { Button } from "../../components/Button/Button";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { stateManager } from "../../../state-context";

export const MyVault = () => {

  const { isConnected } = useAccount()
  const files = stateManager.useStateData('files')();
  const appError = stateManager.useStateData('error')();
  const { writeFile, deleteFile, deleteVault } = stateManager.useStateData('vault-functions')();
  const [ updating, setUpdating ] = useState(false);

  async function add() {
    // TODO
    // setUpdating(true);
    // await writeFile();
    // setUpdating(false);
  }

  async function delFile() {
    // TODO
  }

  async function delVault() {
    // TODO
  }

  return (
    <div className="vault">
      <div className="title">My Vault</div>

      <hr/>

      {/* File List */}
      {files.length === 0 && <span className="info-text">vault is empty</span>}

      {!updating && <Button title="Add File" onClick={add} disabled={!isConnected} />}
      {updating && <div className="loader" />}

      <hr/>

      <div className="text-button" onClick={delVault} disabled={updating || !isConnected} >Delete Vault</div>

      {/* Error log */}
      {appError && <span className='error-text'>{formatError(appError)}</span>}

    </div>
  );
};


function formatError(error) {
  return error.details || error.message || error;
}
