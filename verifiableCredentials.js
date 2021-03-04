import { v4 as uuid } from "uuid";

export function makeVerifiableCredential(ethAddress, subject) {
  let context = [
    "https://www.w3.org/2018/credentials/v1",
    {
      "sameAs": "https://www.w3.org/TR/owl-ref/#sameAs-def",
      "UniswapSybilVerification": {
        "@id": "https://github.com/Uniswap/sybil-list#verifying-an-identity",
        "@context": {
          "sybil": {
            "@id": "https://github.com/Uniswap/sybil-list#schema",
            "@type": "@json"
          }
        }
      }
    }
  ];

  let vc = {
    "@context": context,
    id: "urn:uuid:" + uuid(),
    issuer: "did:ethr:" + ethAddress,
    issuanceDate: new Date().toISOString(),
    type: ["VerifiableCredential"],
    credentialSubject: {
      id: "did:ethr:" + ethAddress,
      sameAs: `https://twitter.com/${subject.twitter.handle}`
    },
    evidence: [
      {
        "type": ["UniswapSybilVerification"],
        "sybil": subject
      }
    ]
  };
  return vc;
};
