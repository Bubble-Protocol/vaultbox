// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import fileIcon from "../../../../assets/file-icon.svg";
import downloadIcon from "../../../../assets/download-icon.svg";
import binIcon from "../../../../assets/bin-icon.svg";
import errorIcon from "../../../../assets/error-icon.png";

export const File = ({ file, status, url, onRead, onDelete }) => {
  return (
    <div className="file">
      {status === 'saved' && <img className="icon" src={fileIcon}></img>}
      {status === 'downloaded' && <a href={url} download={file.name}><img className="icon" src={downloadIcon}></img></a>}
      {(status === 'writing' || status === 'reading') && <div className="loader icon"></div>}
      {status === 'error' && <img className="icon" src={errorIcon}></img>}
      {!url && <div className="name" onClick={() => onRead && onRead(file)}>{file.name}</div>}
      {url && <a href={url} download={file.name}><div className="name">{file.name}</div></a>}
      {status !== 'deleting' && <img className="icon display-on-hover" src={binIcon} onClick={() => onDelete(file)}></img>}
      {status === 'deleting' && <div className="loader icon"></div>}
    </div>
  );
};

File.propTypes = {
  file: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  onRead: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
};
