// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { stateManager } from '../state-context';
import { Wallet } from './Wallet';
import { Session } from './Session';
import { baseGoerli } from 'wagmi/chains';

/**
 * @dev ID used to prefix all local storage entries
 */
const APP_ID = 'bubble-vault';

/**
 * @dev Blockchain ID
 */
const CHAIN = baseGoerli;

/**
 * @dev Remote bubble server that hosts the vault bubbles
 */
const BUBBLE_PROVIDER = "https://vault.bubbleprotocol.com/v2/base-goerli";

/**
 * @dev Application state enum. @See the `state` property below.
 */
const STATES = {
  closed: 'closed',
  new: 'new',
  initialising: 'initialising',
  initialised: 'initialised',
  failed: 'failed'
}


/**
 * The VaultApp class is the entry point for the model. It provides all UI-facing functions
 * and keeps the UI informed of the application state, task list and any errors via the 
 * `stateManager`.
 */
export class VaultApp {

  /**
   * @dev Combined initialisation state of the application and session made available to the UI.
   * 
   *   - closed => wallet not connected
   *   - new => wallet connected but no task list bubble exists. Task list needs creating
   *   - initialising => task list is being initialised (bubble being created or list being loaded)
   *   - initialised => task list has been successfully initialised (available in the `tasks` event)
   *   - failed => task list failed to initialise (cause given in the `error` event)
   */
  state = STATES.closed;

  /**
   * @dev The current 'logged in' session. When the user connects their wallet or switches
   * wallet account a new session is constructed. (@see _accountChanged).
   */
  session;

  /**
   * @dev The wallet handler that listens to the user's wallet state (via wagmi).
   */
  wallet;

  /**
   * @dev Constructs the RainbowKit wallet handler and sets up the initial UI state.
   */
  constructor() {
    // Construct the wallet and listen for changes to the selected account
    this.wallet = new Wallet();
    this.wallet.on('account-changed', this._accountChanged.bind(this));

    // Register UI state data
    stateManager.register('state', this.state);
    stateManager.register('error');
    stateManager.register('files', []);

    // Register UI functions
    stateManager.register('vault-functions', {
      createVault: this.createVault.bind(this),
      readFile: this.readFile.bind(this),
      writeFile: this.writeFile.bind(this),
      deleteFile: this.deleteFile.bind(this),
      deleteVault: this.deleteVault.bind(this)
    });
  }

  /**
   * @dev To be called when the app state is `new`.  Deploys the contract and constructs the
   * bubble.  Keeps the UI up-to-date on the state of the app as the Session is initialised.
   */
  async createVault() {
    return this._initialiseSession();
  }

  /**
   * @dev Writes a new file to the vault. Dispatches the updated file list when complete.
   */
  async readFile(file) {
    if (!this.session) return Promise.reject(new Error('must connect wallet first!'));
    return this.session.readFile(file);
  }

  /**
   * @dev Writes a new file to the vault. Dispatches the updated file list when complete.
   */
  async writeFile(file, content) {
    if (!this.session) return Promise.reject(new Error('must connect wallet first!'));
    return this.session.writeFile(file, content)
    .then(result => {
      stateManager.dispatch('files', [...this.session.getFiles()]);
      return result;
    })
  }

  /**
   * @dev Deletes a file from the bubble. Dispatches the updated file list when complete.
   */
  async deleteFile(file) {
    if (!this.session) return Promise.reject(new Error('must connect wallet first!'));
    return this.session.deleteFile(file)
    .then(() => {
      stateManager.dispatch('files', [...this.session.getFiles()]);
    })
  }

  /**
   * @dev Deletes the vault and all its files
   */
  async deleteVault() {
    if (!this.session) return Promise.reject(new Error('must connect wallet first!'));
    return this.session.deleteVault().finally(() => this.session.isNew() && this._setState(STATES.new));
  }

  /**
   * @dev Called by the wallet whenever the user switches accounts or disconnects their wallet.
   */
  _accountChanged(account) {
    this._closeSession();
    if (account) this._openSession(account);
    else this._setState(STATES.closed);
  }

  /**
   * @dev Starts a new session on first connect or whenever the wallet account is changed. Closes
   * any existing session first, clearing the UI state.
   */
  _openSession(account) {
    this.session = new Session(APP_ID+'-'+account.slice(2).toLowerCase(), CHAIN, BUBBLE_PROVIDER, this.wallet);
    if (!this.session.isNew()) this._initialiseSession();
    else this._setState(STATES.new);
  }

  /**
   * @dev Initialises the Session, which will deploy the contract and construct the bubble if
   * they haven't already been created. Keeps the UI up-to-date on the state of the app as the 
   * Session is initialised.
   */
  async _initialiseSession() {
    this._setState(STATES.initialising);
    return this.session.initialise()
      .then(() => {
        this._setState(STATES.initialised);
        stateManager.dispatch('files', this.session.getFiles())
      })
      .catch(error => {
        console.warn(error);
        this._setState(this.session.isNew() ? STATES.new : STATES.failed);
        stateManager.dispatch('error', error)
      });
  }

  /**
   * @dev Closes any existing session and clears the UI state
   */
  _closeSession() {
    if (this.session) {
      stateManager.dispatch('files', []);
      stateManager.dispatch('error');
      this.session = undefined;
    }
  }

  /**
   * @dev Sets the app state and informs the UI
   */
  _setState(state) {
    this.state = state;
    stateManager.dispatch('state', this.state);
  }

}