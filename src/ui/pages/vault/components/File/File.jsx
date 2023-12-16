// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import "./style.css";
import fileIcon from "../../../../assets/file-icon.svg";
import downloadIcon from "../../../../assets/download-icon.svg";
import binIcon from "../../../../assets/bin-icon.svg";
import errorIcon from "../../../../assets/error-icon.png";
import { stateManager } from "../../../../../state-context";
import { hexToUint8Array } from "@bubble-protocol/crypto/src/utils";

export const File = ({ file, writePromise }) => {

  const { readFile, deleteFile } = stateManager.useStateData('vault-functions')();
  const [ url, setUrl ] = useState();
  const [ error, setError ] = useState();
  const [ deleting, setDeleting ] = useState(false);
  const [ reading, setReading ] = useState(false);
  const [ writing, setWriting ] = useState(writePromise !== undefined);


  useEffect(() => {
    const isWriting = !!writePromise;
    setWriting(isWriting);
    if (isWriting) writePromise.then(() => setWriting(false));
  }, [writePromise])

  async function del() {
    if (error) setError(null);
    setDeleting(true);
    deleteFile(file)
    .catch(error => {
      console.trace(error);
      setError(error)
    })
    .finally(() => setDeleting(false));
  }

  async function download() {
    if (error) setError(null);
    setReading(true);
    readFile(file)
    .then(content => {
      const blob = new Blob([hexToUint8Array(content)], { type: file.mimetype });
      const url = window.URL.createObjectURL(blob);
      setUrl(url);
      setReading(false);
    })
    .catch(error => {
      console.trace(error);
      setError(error);
      setReading(false);
    })
  }

  return (
    <div className="file">
      {/* left icon */}
      {!url && !error && !reading && !writing && <img className="icon" src={fileIcon}></img>}
      {url && !error && !reading && !writing && <a href={url} download={file.name}><img className="icon" src={downloadIcon}></img></a>}
      {error && !reading && !writing && <img className="icon" src={errorIcon}></img>}
      {(reading || writing) && <div className="loader icon"></div>}

      {/* filename */}
      {!url && <div className="name" onClick={download}>{file.name}</div>}
      {url && <a className="name" href={url} download={file.name}>{file.name}</a>}

      {/* right icon */}
      {!deleting && <img className="icon display-on-hover" src={binIcon} onClick={del}></img>}
      {deleting && <div className="loader icon"></div>}
    </div>
  );
};

File.propTypes = {
  file: PropTypes.object.isRequired,
  writePromise: PropTypes.object,
};
