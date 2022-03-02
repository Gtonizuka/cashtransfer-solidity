# UNICEF Cash Transfer smart contract

This repo contains a generic workflow for a cash transfer system based on blockchain.

## Prerequisites
- NodeJS
- HardHat 

## Prerequisites Audit
- Python `v.3.x`
- Slither Analyzer [slither](https://github.com/crytic/slither)
  `pip3 install slither-analyzer `
- Solidity Compiler [sol-select](https://github.com/crytic/solc-select)
  `pip3 install solc-select`
  `solc-select install 0.8.11`
  `solc-select use 0.8.11`

## Commands
- `npm i` to install dependencies
- `npm run compile` or `npx hardhat compile` to compile contract on local machine
- `npm run test` to run unit tests
- `npm run lint` to run linter

## Notes
Please note that the current repo only contains one smart contract.
The smart contract only compiles and runs exclusively on the local machine (e.g. it does not get deployed to testnet or mainnet as no config were provided).

A `next-js` or `cra` frontend for the dapp could easily be added, pointing to the relevant smart contract.