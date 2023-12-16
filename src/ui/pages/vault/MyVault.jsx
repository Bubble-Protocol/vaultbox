// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useEffect, useState } from "react";
import "./style.css";
import { Button } from "../../components/Button/Button";
import { File } from "./components/File";
import { useAccount } from "wagmi";
import { stateManager } from "../../../state-context";
import { useNavigate } from "react-router-dom";
import { uint8ArrayToHex } from "@bubble-protocol/crypto/src/utils";

export const MyVault = () => {

  const navigate = useNavigate();
  const { isConnected } = useAccount()
  const savedFiles = stateManager.useStateData('files')();
  const appError = stateManager.useStateData('error')();
  const { writeFile, deleteVault } = stateManager.useStateData('vault-functions')();
  const [ files, setFiles ] = useState([...savedFiles]);
  const [ writingFiles, setWritingFiles ] = useState([]);
  const [ deletingVault, setDeletingVault ] = useState(false);
  const [ localError, setLocalError ] = useState();
  const inputFile = React.createRef();

  useEffect(() => {
    setFiles([...savedFiles, ...writingFiles].sort((a,b) => a.name.localeCompare(b.name)));
  }, [savedFiles, writingFiles])

  async function openFileChooser() {
    inputFile.current.click();
  }

  async function delVault() {
    if (localError) setLocalError(null);
    if (deletingVault) return;
    setDeletingVault(true);
    deleteVault()
    .then(() => navigate('/'))
    .catch(error => setLocalError(error))
    .finally(() => setDeletingVault(false));
  }

  function addFiles(e) {
    if (localError) setLocalError(null);
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const addedFiles = [];
      for(let i=0; i<fileList.length; i++) {
        addedFiles.push(fileList.item(i));
      }
      addedFiles.forEach(file => {
        const overwrites = savedFiles.find(f => f.name === file.name);
        file.overwrites = overwrites;
        file.writePromise = write(file);
      });
      setWritingFiles([...writingFiles, ...addedFiles]);
    }
  }

  async function write(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(writeFile(file, uint8ArrayToHex(new Uint8Array(reader.result))));
      reader.onerror = () => reject(new Error('failed to read '+file.name));
      reader.readAsArrayBuffer(file);
    })
    .then(() => setWritingFiles(writingFiles.filter(f => f.name !== file.name)))
  }

  return (
    <div className="vault">
      <div className="title">My Vault</div>
      <div className="info-text">
        Your vault is secured using advanced encryption, and access is governed exclusively by your personal smart contract.
        Only your wallet can access and decrypt your vault files.
      </div>
      <hr/>

      {/* File List */}
      <div className="file-list">
        {files.length === 0 && <span className="info-text">vault is empty</span>}
        {files.filter(f => !f.overwrites).map(file => {
          const overwrite = writingFiles.find(f => f.overwrites === file);
          const writePromise = overwrite ? overwrite.writePromise : file.writePromise;
          return <File key={file.name} file={file} writePromise={writePromise}></File> 
        })}
      </div>

      <Button title="Add File" onClick={openFileChooser} disabled={!isConnected} />

      <hr/>

      {!deletingVault && <div className="text-button" onClick={delVault} disabled={!isConnected} >Delete Vault</div>}
      {deletingVault && <div className="loader"></div>}

      {/* Error log */}
      {localError && <span className='error-text'>{formatError(localError)}</span>}
      {!localError && appError && <span className='error-text'>{formatError(appError)}</span>}

      <input id='file' ref={inputFile} type="file" multiple accept='*' hidden={true} onChange={addFiles} />

    </div>
  );
};


function formatError(error) {
  return error.details || error.message || error;
}
