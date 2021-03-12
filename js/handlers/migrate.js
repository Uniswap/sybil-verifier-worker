import { makeVerifiableCredential } from '../verifiableCredentials'
import { hashMessage } from '@ethersproject/hash'
import {
    arrayify,
    hexlify,
} from '@ethersproject/bytes'
import elliptic from 'elliptic'

// IF TOO SLOW, CENTRALIZE IN INDEX AND PASS DOWN
let ec = new elliptic.ec('secp256k1')
let keyPair = ec.keyFromPrivate(arrayify(hexlify(SIGNING_KEY)))

export async function handleMigrate(request) {
    try {
        let body = request.body;
        let migrationEntry = JSON.parse(body)
        let {addr, subject, signature} = migrationEntry;
        let valid = keyPair.verify(arrayify(hashMessage(subject)), signature)
        if (!valid) {
            return new Response(null, init, {
                status: 400,
                statusText: 'Invalid signature' 
            })
        }
        let vcObj = await makeVerifiableCredential(
            addr,
            ISSUER_ADDRESS,
            JSON.parse(subject)
        )

        let vc = JSON.stringify(vcObj)

        await vcs.put(addr, vc)

        let response = new Response(vc, {
            status: 200,
            statusText: 'Succesful migration',
        })

        response.headers.set('Content-Type', 'appliction/json')
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.append('Vary', 'Origin')

        return response
    } catch (e) {
        return new Response(null, init, {
            status: 400,
            statusText: 'Error:' + e,
        })
    }
}