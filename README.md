# Bubble Protocol File Vault Example

Basic demonstration of using private, encrypted off-chain storage for file storage in a decentralised application using [Bubble Protocol](https://github.com/Bubble-Protocol/bubble-sdk). 

This dApp is built using React and the Base Goerli testnet.  

It is available to [try online here](https://bubbleprotocol.com/vault).

## Install & Run This dApp

```
$ git clone git@github.com:Bubble-Protocol/vault.git
$ cd vault
$ npm install
$ npm start
```

## Using WalletConnect

This dApp uses [RainbowKit](https://www.rainbowkit.com/) to provide its wallet connectivity. If you want to connect your wallet via [WalletConnect](https://walletconnect.com/) then add your `WalletConnect` Project ID to [src/rainbow-kit.js](./src/rainbow-kit.js).

## How To Use A Bubble In Your Own dApp

See the [Bubble Protocol SDK client package](https://github.com/Bubble-Protocol/bubble-sdk/tree/main/packages/client).

## Community

- [Discord](https://discord.gg/sSnvK5C)
- [Twitter](https://twitter.com/BubbleProtocol)

## Copyright

Copyright (c) 2023 [Bubble Protocol](https://bubbleprotocol.com)

Released under the [MIT License](LICENSE)