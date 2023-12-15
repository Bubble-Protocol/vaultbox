// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const Button = ({ title, onClick, disabled=false }) => {
  return (
    <div className={"button" + (disabled ? " disabled" : " enabled")}>
      <div className="button-text" onClick={e => {if (!disabled) onClick(e)}}>{title}</div>
    </div>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
