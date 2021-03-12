import { hashMessage } from '@ethersproject/hash'
import {
    arrayify,
    hexlify,
} from '@ethersproject/bytes'
import elliptic from 'elliptic'

let ec = new elliptic.ec('secp256k1')
// TODO: Add ENV VAR for SIGNING_KEY and WORKER_HOST
let keyPair = ec.keyFromPrivate(arrayify(hexlify(SIGNING_KEY)))

async function main() {
    let fileRes = await fetch('https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json');
    let old = await fileRes.json();
    let oldKeys = Object.keys(old);
    let url = `${WORKER_HOST}/api/migration`

    // for (let i = 0, n = oldKeys.length; i < n; i++) {
    // TODO: Restore after test
    for (let i = 0, n = 1; i < n; i++) {
        let addr = oldKeys[i];
        let subjWrapper = old[key];
        let subjectObj = subjWrapper?.twitter;
        let subject = JSON.stringify(subjectObj);
        let signature = keyPair.sign(
            arrayify(hashMessage(subject)),
            { canonical: true }
        )

        let valid = keyPair.verify(subject, signature)
        if (!valid) {
            console.error(`Failed to sign with addr: ${addr}`)
        }

        /* TODO: RESTORE AFTER TEST
        let body = JSON.stringify(
            {
                addr: addr,
                subject: subject,
                signature: signature
            }
        );

        try {
            let res = await fetch(url, {
                method: "POST",
                body: body
            })

            let j = await res.json()
        } catch (e) {
            console.error(`Failed to migrate address ${addr}, err: ${e?.message ? e.message : e}`)
        }
        */
    }

    console.log("Complete")
}