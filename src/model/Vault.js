// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { bubbleProviders, encryptionPolicies, Bubble, toFileId } from '@bubble-protocol/client';
import { ContentId, assert } from '@bubble-protocol/core';
import { ecdsa } from '@bubble-protocol/crypto';

const INDEX_FILE = '0x'+ecdsa.hash("*bubble protocol vault index file*");

/**
 * Encapsulates a vault and its off-chain bubble.  The bubble's contract is defined by the 
 * smart contract in `./contracts/VaultBubble.sol`, which is deployed by the Session class's 
 * initialise function.
 * 
 */
export class Vault {

  /**
   * @dev The off-chain bubble, instance of the Bubble class.
   */
  bubble;

  /**
   * @dev Local copy of the file list, read from the bubble during initialisation.
   */
  files = [];

  /**
   * @dev Local copy of the file name index, read from the bubble during initialisation.
   */
  index = [];

  /**
   * @dev Constructs the `bubble` object, an instance of the `Bubble` class. Specifies HTTP(S) as
   * the interface to the off-chain bubble host, and specifies an AESGCM encryption policy to
   * encrypt all contents with the given encryption key.
   */
  constructor(bubbleId, signFunction, encryptionKey) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    const provider = new bubbleProviders.HTTPBubbleProvider(bubbleId.provider);
    const encryptionPolicy = new encryptionPolicies.AESGCMEncryptionPolicy(encryptionKey);
    this.bubble = new Bubble(bubbleId, provider, signFunction, encryptionPolicy);
  }

  /**
   * @dev Constructs the off-chain bubble. Does not reject if the bubble already exists.
   */
  async create(options={}) {
    return this.bubble.create({silent: true, ...options});
  }

  /**
   * @dev Loads the vault from the bubble and initialises the `files` array.
   */
  async initialise() {
    console.trace('initialising vault');
    console.trace('bubble id:', this.bubble.contentId.toObject());
    console.trace('bubble id as DID:', this.bubble.contentId.toDID());
    this.index = await this._readIndex();
    const fileList = await this.bubble.list(toFileId(0));

    this.files = fileList.filter(f => f.name !== INDEX_FILE).map(f => {
      const nameMap = this.index.find(i => i.hash === f.name) || {hash: f.name, name: f.name, mimetype: 'application/octet-stream'};
      return {...f, ...nameMap};
    });
    console.trace('index file', this.index);
    console.trace('loaded vault', this.files);
  }

  /**
   * @dev Promises to write the file to the vault bubble.
   */
  async readFile(file) {
    console.trace('reading file', file.hash, file.name, file.mimetype);
    return await this.bubble.read(file.hash);
  }

  /**
   * @dev Promises to read the file from the vault bubble.
   */
  async writeFile(file, content) {
    console.trace('writing file', file.name);
    const now = Date.now();
    const hash = '0x'+ecdsa.hash(file.name);
    if (this.index.findIndex(i => i.hash === hash) < 0) this.index.push({hash: hash, name: file.name, mimetype: file.type});
    await this._writeIndex();
    await this.bubble.write(hash, content);
    if (!this.files.find(f => f.name === file.name)) {
      this.files.push({ name: file.name, hash: hash, type: 'file', mimetype: file.type, length: content.length, created: now, modified: now });
    }
  }

  /**
   * @dev Promises to delete the given task from tasks array and the bubble.
   */
  async deleteFile(file) {
    console.trace('deleting file', file);
    await this.bubble.delete(file.hash);
    this.files = this.files.filter(f => file.hash !== f.hash);
    this.index = this.index.filter(f => file.hash !== f.hash);
    await this._writeIndex();
  }

  /**
   * @dev Promises to delete the vault bubble, permanently deleting all files within.
   * 
   * The vault smart contract must be terminated to use this method.
   */
  async deleteVault() {
    await this.bubble.terminate({silent: true});
    this.files = [];
    this.index = [];
  }

  /**
   * @dev Reads and parses the index file. 
   */
  async _readIndex() {
    console.trace('reading index file ', INDEX_FILE);
    const json = await this.bubble.read(INDEX_FILE).catch(() => null);
    if (!json) return [];
    return JSON.parse(json);
  }
  
  /**
   * @dev Writes the index file
   */
  async _writeIndex() {
    console.trace('writing index file ', INDEX_FILE);
    return this.bubble.write(INDEX_FILE, JSON.stringify(this.index));
  }

}