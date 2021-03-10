import { v4 as uuid } from 'uuid'
import { joinSignature } from 'ethers';
import { SigningKey } from "@ethersproject/signing-key";

export async function makeVerifiableCredential(
    subjectAddress,
    issuerAddress,
    signingAddress,
    subject
) {
    let context = [
        'https://www.w3.org/2018/credentials/v1',
        {
            sameAs: 'https://www.w3.org/TR/owl-ref/#sameAs-def',
            UniswapSybilVerification: {
                '@id':
                    'https://github.com/Uniswap/sybil-list#verifying-an-identity',
                '@context': {
                    sybil: {
                        '@id': 'https://github.com/Uniswap/sybil-list#schema',
                        '@type': '@json',
                    },
                },
            },
        },
    ]

    let doc = {
        '@context': context,
        id: 'urn:uuid:' + uuid(),
        issuer: 'did:ethr:' + issuerAddress,
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential'],
        credentialSubject: {
            id: 'did:ethr:' + subjectAddress,
            sameAs: `https://twitter.com/${subject.twitter.handle}`,
        },
        evidence: [
            {
                type: ['UniswapSybilVerification'],
                sybil: subject,
            },
        ],
    }

    return await makeEthVc(subjectAddress, signingAddress, doc)
}

async function makeEthVc(subjectAddress, signingAddress, doc) {
    const credentialString = JSON.stringify(doc)

    const did = `did:ethr:${subjectAddress}`

    const proofOptions = {
        verificationMethod: did + '#Eip712Method2021',
        proofPurpose: 'assertionMethod',
    }

    const keyType = { kty: 'EC', crv: 'secp256k1', alg: 'ES256K-R' }

    let prepStr
    console.log('about to init didkit')
    try {
        const { completeIssueCredential, prepareIssueCredential } = wasm_bindgen
        await wasm_bindgen(wasm)

        console.log('about to prepare')
        prepStr = await prepareIssueCredential(
            credentialString,
            JSON.stringify(proofOptions),
            JSON.stringify(keyType)
        )

        console.log('after prepare')
        let preparation = JSON.parse(prepStr)
        const typedData = preparation.signingInput

        if (!typedData || !typedData.primaryType) {
            console.error('proof preparation:', preparation)
            throw new Error('Expected EIP-712 TypedData')
        }

        console.log('about to make wallet')
        const signingKey = new SigningKey(signingAddress)

        console.log('about to sign')
        let signature = joinSignature(signingKey.signDigest(JSON.stringify(typedData)));

        console.log('about to complete issue')
        let vcStr = await completeIssueCredential(
            credentialString,
            JSON.stringify(preparation),
            signature
        )

        console.log('about to return from vc maker')
        return JSON.parse(vcStr)
    } catch (err) {
        // TODO: Change to throw
        console.error(err)
        return
    }
}
