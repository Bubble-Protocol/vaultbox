// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import "./style.css";
import { Button } from "../../components/Button/Button";
import { File } from "./components/File";
import { useAccount } from "wagmi";
import { stateManager } from "../../../state-context";

export const MyVault = () => {

  const { isConnected } = useAccount()
  const files = stateManager.useStateData('files')();
  const appError = stateManager.useStateData('error')();
  const { writeFile, deleteFile, deleteVault } = stateManager.useStateData('vault-functions')();
  const [ writing, setWriting ] = useState([]);
  const [ deleting, setDeleting ] = useState([]);
  const [ localError, setLocalError ] = useState();
  const inputFile = React.createRef();

  async function openFileChooser() {
    inputFile.current.click();
  }

  async function delFile(file) {
    setDeleting([...deleting, file]);
    deleteFile(file)
    .finally(() => setDeleting(deleting.filter(f => f !== file)));
  }

  async function delVault() {
    // TODO
  }

  function addFiles(e) {
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
          reader.onload = () => resolve(writeFile(file.name, reader.result));
          reader.onerror = () => reject(new Error('failed to read '+file.name));
          reader.readAsBinaryString(file);
        })
        .then(() => setWriting(writing.filter(f => f.name !== file.name)))
        .catch(error => setWriting(writing.map(f => { return f.name !== file.name ? f : {...f, status: 'error', error: error} } )))
      })
    }
  }


  return (
    <div className="vault">
      <div className="title">My Vault</div>

      <hr/>

      {/* File List */}
      <div className="file-list">
        {files.length === 0 && writing.length === 0 && <span className="info-text">vault is empty</span>}
        {files.length > 0 && files.map(file => { return <File key={file.name} file={file} status={deleting.includes(file) ? "deleting" : "saved"} onDelete={delFile}></File> })}
        {writing.length > 0 && writing.map(file => { return <File key={file.name} file={file} status="writing" onDelete={()=>{}}></File> })}
      </div>

      <Button title="Add File" onClick={openFileChooser} disabled={!isConnected} />

      <hr/>

      <div className="text-button" onClick={delVault} disabled={!isConnected} >Delete Vault</div>

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
