import { WebCryptoP256 } from 'ox';
import { http, createPublicClient } from 'viem';
import { toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { mainnet } from 'viem/chains';

import { toP256Account } from './toP256Account.js';

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const keypair = await WebCryptoP256.createKeyPair();
const owner = toP256Account(keypair);

const account = await toCoinbaseSmartAccount({
  client,
  owners: [owner],
});

const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 69n,
  maxFeePerGas: 69n,
  maxPriorityFeePerGas: 69n,
  nonce: 0n,
  preVerificationGas: 69n,
  signature: await account.getStubSignature(),
  verificationGasLimit: 69n,
});

console.log(signature);
