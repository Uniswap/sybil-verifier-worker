import { v4 as uuid } from 'uuid'
import { hashMessage } from '@ethersproject/hash'
import {
    arrayify,
    hexlify,
    hexZeroPad,
    splitSignature,
    joinSignature,
} from '@ethersproject/bytes'
import elliptic from 'elliptic'

let ec = new elliptic.ec('secp256k1')
let keyPair = ec.keyFromPrivate(arrayify(hexlify(SIGNING_KEY)))

export async function makeVerifiableCredential(
    subjectAddress,
    issuerAddress,
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

    return await makeEthVc(subjectAddress, doc)
}

async function makeEthVc(subjectAddress, doc) {
    const credentialString = JSON.stringify(doc)

    const did = `did:ethr:${subjectAddress}`

    const proofOptions = {
        verificationMethod: did + '#Eip712Method2021',
        proofPurpose: 'assertionMethod',
    }

    const keyType = { kty: 'EC', crv: 'secp256k1', alg: 'ES256K-R' }

    let prepStr
    try {
        const { completeIssueCredential, prepareIssueCredential } = wasm_bindgen
        await wasm_bindgen(wasm)

        console.log('about to prepare')
        prepStr = await prepareIssueCredential(
            credentialString,
            JSON.stringify(proofOptions),
            JSON.stringify(keyType)
        )

        let preparation = JSON.parse(prepStr)
        const typedData = preparation.signingInput

        if (!typedData || !typedData.primaryType) {
            console.error('proof preparation:', preparation)
            throw new Error('Expected EIP-712 TypedData')
        }

        console.log('about to sign')
        let signature = keyPair.sign(
            arrayify(hashMessage(JSON.stringify(typedData))),
            { canonical: true }
        )
        signature = joinSignature(
            splitSignature({
                recoveryParam: signature.recoveryParam,
                r: hexZeroPad('0x' + signature.r.toString(16), 32),
                s: hexZeroPad('0x' + signature.s.toString(16), 32),
            })
        )
        console.log(signature)

        console.log('about to complete issue')
        let vcStr = await completeIssueCredential(
            credentialString,
            JSON.stringify(preparation),
            signature
        )

        console.log('about to return from vc maker')
        return JSON.parse(vcStr)
        return { hello: 'worker' }
    } catch (err) {
        // TODO: Change to throw
        console.error(err)
        return
    }
}
