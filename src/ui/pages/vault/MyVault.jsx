// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import "./style.css";
import { Button } from "../../components/Button/Button";
import { File } from "./components/File";
import { useAccount } from "wagmi";
import { stateManager } from "../../../state-context";
import { useNavigate } from "react-router-dom";
import { hexToUint8Array, uint8ArrayToHex } from "@bubble-protocol/crypto/src/utils";

export const MyVault = () => {

  const navigate = useNavigate();
  const { isConnected } = useAccount()
  const files = stateManager.useStateData('files')();
  const appError = stateManager.useStateData('error')();
  const { readFile, writeFile, deleteFile, deleteVault } = stateManager.useStateData('vault-functions')();
  const [ writing, setWriting ] = useState([]);
  const [ deleting, setDeleting ] = useState([]);
  const [ reading, setReading ] = useState([]);
  const [ deletingVault, setDeletingVault ] = useState(false);
  const [ localError, setLocalError ] = useState();
  const inputFile = React.createRef();

  async function openFileChooser() {
    inputFile.current.click();
  }

  async function delFile(file) {
    if (localError) setLocalError(null);
    setDeleting([...deleting, file]);
    deleteFile(file)
    .catch(error => setLocalError(error))
    .finally(() => setDeleting(deleting.filter(f => f !== file)));
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
      const files = [];
      for(let i=0; i<fileList.length; i++) {
        files.push(fileList.item(i));
      }
      setWriting([...writing, ...files]);
      files.forEach(file => {
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(writeFile(file, uint8ArrayToHex(new Uint8Array(reader.result))));
          reader.onerror = () => reject(new Error('failed to read '+file.name));
          reader.readAsArrayBuffer(file);
        })
        .then(() => setWriting(writing.filter(f => f.name !== file.name)))
        .catch(error => setWriting(writing.map(f => { return f.name !== file.name ? f : {...f, status: 'error', error: error} } )))
      })
    }
  }

  async function downloadFile(file) {
    if (localError) setLocalError(null);
    setReading([...reading, {file}]);
    readFile(file)
    .then(content => {
      const blob = new Blob([hexToUint8Array(content)], { type: file.mimetype });
      const url = window.URL.createObjectURL(blob);
      setReading([...reading.filter(f => f !== file), {file, url}]);
    })
    .catch(error => {
      setLocalError(error);
      setReading(reading.filter(f => f !== file));
    })
  }

  return (
    <div className="vault">
      <div className="title">My Vault</div>

      <hr/>

      {/* File List */}
      <div className="file-list">
        {files.length === 0 && writing.length === 0 && <span className="info-text">vault is empty</span>}
        {files.length > 0 && files.map(file => {
          const download = reading.find(f => f.file === file) || {url:undefined};
          const status = deleting.includes(file) ? "deleting" : download.url ? "downloaded" : download.file ? "reading" : "saved"
          return <File key={file.name} file={file} status={status} url={download.url} onDelete={delFile} onRead={downloadFile}></File> 
        })}
        {writing.length > 0 && writing.map(file => { return <File key={file.name} file={file} status="writing" onDelete={()=>{}}></File> })}
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
