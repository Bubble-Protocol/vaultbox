// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { bubbleProviders, encryptionPolicies, Bubble, toFileId } from '@bubble-protocol/client';
import { ContentId, assert } from '@bubble-protocol/core';


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
   * @dev Local copy of the task list, read from the bubble during initialisation.
   */
  files = [];

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
    this.files = await this.bubble.list(toFileId(0));
    console.trace('loaded vault', this.files);
  }

  /**
   * @dev Promises to add a new task and write it to the bubble.
   */
  async writeFile(file) {
    // TODO
    console.trace('writing file', file);
    const content = ''; // TODO
    await this.bubble.write(file, content);
    this.files.push(file);
  }

  /**
   * @dev Promises to delete the given task from tasks array and the bubble.
   */
  async deleteFile(file) {
    console.trace('deleting file', file);
    await this.bubble.delete(file);
    this.files = this.files.filter(f => file !== f);
  }


}