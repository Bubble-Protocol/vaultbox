// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { watchAccount, getWalletClient, getPublicClient, getNetwork } from 'wagmi/actions';
import { EventManager } from './utils/EventManager';

const STATES = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Wrapper for a wagmi wallet.  Provides a deploy contract function and an 
 * event manager for clients to listen for a change to the wallet account.
 */
export class Wallet {

  state = STATES.disconnected;
  account;
  provider;
  listeners = new EventManager(['account-changed']);
  closeWatchers = [];

  constructor() {
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
    this.closeWatchers.push(watchAccount(this._handleAccountsChanged)) 
  }

  getChain() {
    const { chain } = getNetwork();
    if (chain) return chain.id;
    else return undefined;
  }

  async deploy(chain, abi, bytecode, args=[], options={}) {

    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();

    const txHash = await walletClient.deployContract({
      account: this.account,
      abi,
      bytecode,
      args,
      chain,
      ...options
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    return receipt.contractAddress;
  }

  async send(contractAddress, abi, method, params=[], options={}) { 

    const chainId = this.getChain()
    const walletClient = await getWalletClient({chainId});
    const publicClient = getPublicClient({chainId});

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params,
      ...options
    })

    console.trace('txHash', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.trace('receipt', receipt);

    return receipt;
  }

  async close() {
    this.closeWatchers.forEach(unwatch => unwatch());
    this.closeWatchers = [];
    this.state = STATES.disconnected;
    return Promise.resolve();
  }

  _handleAccountsChanged(acc) {
    if (acc && acc.address) {
      this.account = acc.address;
      this.connector = acc.connector;
      console.trace('wallet connected with account', this.account);
      this.state = STATES.connected;
    }
    else {
      this.account = undefined;
      this.connector = undefined;
      console.trace('wallet disconnected');
      this.state = STATES.disconnected;
    }
    this.listeners.notifyListeners('account-changed', this.account);
  }

}