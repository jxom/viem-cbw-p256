import {
  AbiParameters,
  Base64,
  Hash,
  Hex,
  PublicKey,
  Signature,
  WebCryptoP256,
} from 'ox';
import { hashMessage, hashTypedData } from 'viem';
import type { WebAuthnAccount } from 'viem/account-abstraction';

export type ToP256AccountParameters = {
  publicKey: PublicKey.PublicKey;
  privateKey: CryptoKey;
};

const authenticatorData =
  '0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000' as const;

export function toP256Account(
  parameters: ToP256AccountParameters
): WebAuthnAccount {
  const { privateKey, publicKey } = parameters;

  const sign = async (payload: Hex.Hex) => {
    const challengeBase64 = Base64.from(payload, { url: true, pad: false });
    const clientDataJSON = `{"type":"webauthn.get","challenge":"${challengeBase64}","origin":"https://keys.coinbase.com"}`;
    const challengeIndex = clientDataJSON.indexOf('"challenge":');
    const typeIndex = clientDataJSON.indexOf('"type":');
    const clientDataJSONHash = Hash.sha256(Hex.from(clientDataJSON));
    const message = AbiParameters.encodePacked(
      ['bytes', 'bytes32'],
      [authenticatorData, clientDataJSONHash]
    );
    const signature = await WebCryptoP256.sign({
      payload: message,
      privateKey,
    });
    return {
      signature: Signature.serialize(signature),
      webauthn: {
        authenticatorData,
        challengeIndex,
        clientDataJSON,
        typeIndex,
        userVerificationRequired: false,
      },
    };
  };

  return {
    publicKey: Hex.slice(PublicKey.serialize(publicKey), 1),
    async sign({ hash }) {
      return sign(hash);
    },
    async signMessage({ message }) {
      return sign(hashMessage(message));
    },
    async signTypedData(parameters) {
      return sign(hashTypedData(parameters));
    },
    type: 'webAuthn',
  };
}
