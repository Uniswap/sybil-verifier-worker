import { v4 as uuid } from 'uuid';
import { loadDIOKit } from './DIDKit';
import { ethers } from 'ethers';

export async function makeVerifiableCredential(subjectAddress, subject, mnemonic) {
  let context = [
    'https://www.w3.org/2018/credentials/v1',
    {
      'sameAs': 'https://www.w3.org/TR/owl-ref/#sameAs-def',
      'UniswapSybilVerification': {
        '@id': 'https://github.com/Uniswap/sybil-list#verifying-an-identity',
        '@context': {
          'sybil': {
            '@id': 'https://github.com/Uniswap/sybil-list#schema',
            '@type': '@json'
          }
        }
      }
    }
  ];

  let doc = {
    '@context': context,
    id: 'urn:uuid:' + uuid(),
    issuer: 'did:ethr:' + subjectAddress,
    issuanceDate: new Date().toISOString(),
    type: ['VerifiableCredential'],
    credentialSubject: {
      id: 'did:ethr:' + subjectAddress,
      sameAs: `https://twitter.com/${subject.twitter.handle}`
    },
    evidence: [
      {
        'type': ['UniswapSybilVerification'],
        'sybil': subject
      }
    ]
  };


  return await makeEthVc(subjectAddress, doc, mnemonic);

};

async function makeEthVc(subjectAddress, doc, mnemonic) {
  const DIDKit = await loadDIOKit();

  const credentialString = JSON.stringify(
    doc
  );

  const did = `did:ethr:${subjectAddress}`;

  const proofOptions = {
    verificationMethod: did + '#Eip712Method2021',
    proofPurpose: 'assertionMethod',
  };

  const keyType = { kty: 'EC', crv: 'secp256k1', alg: 'ES256K-R' };

  let prepStr = await DIDKit.prepareIssueCredential(
    credentialString,
    JSON.stringify(proofOptions),
    JSON.stringify(keyType)
  );

  let preparation = JSON.parse(prepStr);
  const typedData = preparation.signingInput;

  if (!typedData || !typedData.primaryType) {
    console.error('proof preparation:', preparation);
    throw new Error('Expected EIP-712 TypedData');
  };

  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  let signature = wallet.signMessage(JSON.stringify(typedData));

  let vcStr = await DIDKit.completeIssueCredential(
    credentialString,
    JSON.stringify(preparation),
    signature
  );

  return JSON.parse(vcStr);
}
