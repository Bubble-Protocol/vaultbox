// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import * as contractSourceCode from './contracts/VaultBubble.json';
import { ecdsa } from '@bubble-protocol/crypto';
import { ContentId, assert } from '@bubble-protocol/core';
import { Vault } from './Vault';

/**
 * A Session is an instance of the app with a locally saved state. The local device can support
 * multiple sessions allowing the user to have different TODO Lists for different wallet accounts.
 * 
 * The Session is identified by its ID, passed in the constructor. The state is saved to 
 * localStorage with the Session ID as the key name.
 * 
 * The Session is responsible for initialising the vault, including deploying the smart 
 * contract and constructing the bubble if they haven't been created before.  The bubble itself
 * is encapsulated in the Vault class.
 */
export class Session {

  /**
   * @dev The session private key, held in local storage and read on construction.
   */
  key;

  /**
   * @dev The session's off-chain bubble id. Held in local storage and read on construction.
   */
  bubbleId;

  /**
   * @dev FileList managed by this Session. It is constructed and initialised in the `initialise` method.
   */
  vault;

  /**
   * @dev Constructs this Session from the locally saved state.
   */
  constructor(id, config, wallet) {
    assert.isString(id, 'id');
    assert.isObject(config, 'config');
    assert.isObject(wallet, 'wallet');
    this.id = id;
    this.config = config;
    this.wallet = wallet;
    this._loadState();
  }

  /**
   * @dev Initialises the Vault deploying the smart contract and constructing the bubble if
   * required. The state of construction is determined by the properties read from the local saved 
   * state during construction.
   * 
   * i.e.: 
   * 
   *   this.key = null                 ->  New, so construct application key
   *   this.bubbleId = null            ->  Smart contract has not yet been deployed, so deploy it
   *   this.bubbleId.provider = null   ->  Off-chain bubble has not yet been created so create it.
   *   this.bubbleId.provider != null  ->  Fully constructed so initialise the TaskList
   *  
   */
  async initialise() {

    console.trace('Initialising session');

    if (!this.key) {
      // brand new session
      console.trace('creating session key');
      this.key = new ecdsa.Key();
      this._saveState();
    }

    if (!this.bubbleId || !this.bubbleId.contract) {
      // contract has not yet been deployed
      console.trace('deploying contract');
      const {address, chain} = await this.wallet.deploy(
        contractSourceCode.default.abi, 
        contractSourceCode.default.bin, 
        [this.key.address]
      );
      this.bubbleId = {
        chain: chain,
        contract: address
      }
      this._saveState();
    }

    if (!this.bubbleId.provider) {
      // bubble has not yet been constructed
      this.bubbleId.provider = this.config.providers[this.bubbleId.chain];
      console.trace('constructing bubble', this.bubbleId);
      this.vault = new Vault(new ContentId(this.bubbleId), this.key.signFunction, this.key.privateKey);
      await this.vault.create();
      this._saveState();
    }
    else {
      // bubble has already been constructed
      this.vault = new Vault(new ContentId(this.bubbleId), this.key.signFunction, this.key.privateKey);
    }

    await this.vault.initialise();

  }

  /**
   * @dev Forwarded to the vault
   */
  async readFile(file) {
    if (!this.vault) return Promise.reject('session not initialised');
    return this.vault.readFile(file);
  }

  /**
   * @dev Forwarded to the vault
   */
  async writeFile(file, content) {
    if (!this.vault) return Promise.reject('session not initialised');
    return this.vault.writeFile(file, content);
  }

  /**
   * @dev Forwarded to the taskList
   */
  async deleteFile(file) {
    if (!this.vault) return Promise.reject('session not initialised');
    return this.vault.deleteFile(file);
  }

  /**
   * @dev Forwarded to the taskList
   */
  async deleteVault() {
    if (!this.vault) return Promise.reject('session not initialised');
    console.trace('terminating contract', this.bubbleId.contract);
    await this.wallet.send(
      this.bubbleId.contract,
      contractSourceCode.default.abi, 
      'terminate',
      []
    );
    console.trace('deleting bubble', this.bubbleId); 
    this.bubbleId = undefined;
    this._saveState();
    await this.vault.deleteVault();  // it will be deleted anyway but this will force it straight away
  }

  /**
   * @dev Return the current files from vault
   */
  getFiles() {
    if (!this.vault) return Promise.reject('session not initialised');
    return this.vault.files;
  }

  /**
   * @dev Return the current vault's bubble id
   */
  getBubbleId() {
    if (!this.vault) return Promise.reject('session not initialised');
    return this.vault.bubble.contentId;
  }

  /**
   * @dev Returns `true` if the smart contract has not yet been deployed
   */
  isNew() {
    return this.bubbleId === undefined || this.bubbleId.contract === undefined;
  }

  /**
   * @dev Loads the Session state from localStorage
   */
  _loadState() {
    const stateJSON = window.localStorage.getItem(this.id);
    const stateData = stateJSON ? JSON.parse(stateJSON) : {};
    console.trace('loaded state', stateData);
    this.key = stateData.key ? new ecdsa.Key(stateData.key) : undefined;
    this.bubbleId = stateData.bubbleId;
  }

  /**
   * @dev Saves the Session state to localStorage
   */
  _saveState() {
    const stateData = {
      key: this.key.privateKey,
      bubbleId: this.bubbleId
    };
    window.localStorage.setItem(this.id, JSON.stringify(stateData));
  }

}