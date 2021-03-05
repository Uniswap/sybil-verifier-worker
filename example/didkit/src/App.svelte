<script lang="ts">
    import { onMount } from 'svelte'
    import loadDIDKit from './DIDKit.js'

    const sybilListURL =
        'https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json'

    $: accountId = ''
    $: addr = ''
    $: credentialUrl = ''
    $: errorMessage = ''
    $: statusMessage = ''
    $: tweet = ''
    $: workerHost = ''

    $: DIDKit = false
    $: ethereum = false
    $: sybilJSON = false
    $: vc = false

    async function requestVerifiedCredential() {
        if (!tweet) {
            errorMessage = 'TweetID is required'
            return
        }

        if (!addr) {
            errorMessage = 'Ethereum Address is required'
            return
        }

        if (!workerHost) {
            errorMessage = 'Worker host is required'
            return
        }

        let target = `${workerHost}?id=${tweet}&account=${addr}`

        let h = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Method': '*',
        })

        try {
            let workerRes = await fetch(target, {
                "header": h,
            })

            if (!workerRes.ok || workerRes.status !== 200) {
                errorMessage = `Failed in request: ${workerRes.statusText}`
                return
            }

            let workerJSON = await workerRes.json()

            console.log('SUCCESS', workerJSON)
            if (!workerJSON.verifiableCredential) {
                errorMessage = 'No verifiable credential in response'
                return
            }

            errorMessage = ''

            const credentialString = JSON.stringify(
                workerJSON.verifiableCredential
            )

            const did = `did:ethr:${addr}`

            const proofOptions = {
                verificationMethod: did + '#Eip712Method2021',
                proofPurpose: 'assertionMethod',
            }

            const keyType = { kty: 'EC', crv: 'secp256k1', alg: 'ES256K-R' }

            statusMessage = 'Preparing credential...'
            let prepStr = await DIDKit.prepareIssueCredential(
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

            statusMessage = 'Waiting for signature...'
            const signature = await ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [accountId, JSON.stringify(typedData)],
            })

            let vcStr = await DIDKit.completeIssueCredential(
                credentialString,
                JSON.stringify(preparation),
                signature
            )

            vc = JSON.parse(vcStr)
            credentialUrl = createJsonBlobUrl(vc)
            console.log('SUCCESS AGAIN', vc)
        } catch (err) {
            errorMessage = err
        }
    }

    async function getSybilJSON() {
        try {
            let sybilListRes = await fetch(sybilListURL)
            if (!sybilListRes.ok || sybilListRes.status !== 200) {
                errorMessage = `Failed in request: ${sybilListRes.statusText}`
                return false
            }

            sybilJSON = await sybilListRes.json()
        } catch (err) {
            errorMessage = err
        }
    }

    function getRandomSybilEntry() {
        let keys = Object.keys(sybilJSON)
        addr = keys[Math.floor(Math.random() * keys.length)]
        tweet = sybilJSON[addr].twitter.tweetID
    }

    async function getEthereum() {
        return new Promise((resolve, reject) => {
            if (!window.ethereum) {
                return reject(new Error('Ethereum wallet not found.'))
            }
            if (!window.ethereum.request) {
                return reject(new Error('Ethereum request function not found.'))
            }
            resolve(window.ethereum)
        })
    }

    const getFirstConnectedWallet = async () => {
        try {
            let wallets = await ethereum.request({
                method: 'eth_requestAccounts',
            })
            if (!wallets || !wallets.length) {
                throw 'Failed to find wallet'
            }
            return wallets[0]
        } catch (err) {
            // TODO: Handle this better?
            console.error(err)
            return []
        }
    }

    const createJsonBlobUrl = object => {
        if (!object) return null
        const blob = new Blob([JSON.stringify(object, null, 2)])
        return URL.createObjectURL(blob, { type: 'application/json' })
    }

    onMount(async () => {
        await getSybilJSON()
        try {
            DIDKit = await loadDIDKit()
            ethereum = await getEthereum()
            accountId = await getFirstConnectedWallet()
        } catch (err) {
            errorMessage = err.message
        }
    })
</script>

<main>
    <div>
        <h2>Uniswap Sybil Verifiable Credential Example</h2>
        {#if errorMessage}
            <div>{errorMessage}</div>
        {/if}
        {#if statusMessage}
            <div>{statusMessage}</div>
        {/if}
        <div>
            <h3>Generate VC With Tweet ID and Ethereum Address</h3>

            <label for="worker-host">Set Worker Host:</label>
            <input
                name="worker-host"
                id="worker-host"
                bind:value={workerHost}
            />

            <label for="tweet-id">Set Tweet ID:</label>
            <input name="tweet-id" id="tweet-id" bind:value={tweet} />

            <label for="ethereum-address">Set Ethereum Address:</label>
            <input
                name="ethereum-address"
                id="ethereum-address"
                bind:value={addr}
            />
            <p>
                {#if !DIDKit || !ethereum}
                    <p>Loading...</p>
                {:else}
                    <button id="request" on:click={requestVerifiedCredential}
                        >Generate Verifiable Credential</button
                    >
                {/if}
            </p>
            <div>
                {#if !sybilJSON}
                    <p>Loading...</p>
                {:else}
                    <button id="random" on:click={getRandomSybilEntry}
                        >Get Random Sybil Instance</button
                    >
                {/if}
            </div>
            {#if vc}
                <a href={credentialUrl}>Download Verifiable Credential</a>
            {/if}
        </div>
    </div>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }
</style>
