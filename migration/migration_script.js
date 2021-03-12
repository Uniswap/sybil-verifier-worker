let hashMessage = require('@ethersproject/hash').hashMessage
let arrayify = require('@ethersproject/bytes').arrayify
let hexlify = require('@ethersproject/bytes').hexlify
let elliptic = require('elliptic')
let fetch = require('node-fetch')

let ec = new elliptic.ec('secp256k1')
let keyPair = ec.keyFromPrivate(arrayify(hexlify(process.env.SIGNING_KEY)))

async function main() {
    let fileRes = await fetch(
        'https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json'
    )
    let old = await fileRes.json()
    let oldKeys = Object.keys(old)
    let url = `${process.env.WORKER_HOST}/api/migration`

    for (let i = 0, n = oldKeys.length; i < n; i++) {
        let addr = oldKeys[i]
        let subjWrapper = old[addr]
        let subjectObj = subjWrapper
        let subject = JSON.stringify(subjectObj)
        let signature = keyPair.sign(arrayify(hashMessage(subject)), {
            canonical: true,
        })

        let valid = keyPair.verify(arrayify(hashMessage(subject)), signature)
        if (!valid) {
            console.error(`Failed to sign for addr: ${addr}`)
            continue
        }

        let body = JSON.stringify({
            addr: addr,
            subject: subject,
            signature: signature,
        })

        try {
            let res = await fetch(url, {
                method: 'POST',
                body: body,
            })

            let j = await res.json()
        } catch (e) {
            console.error(
                `Failed to migrate address ${addr}, err: ${
                    e?.message ? e.message : e
                }`
            )
        }
    }

    console.log('Complete')
}

main()
