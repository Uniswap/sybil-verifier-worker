## Sybil Verifier

This is a verifier used by the Sybil interface for verifying links between Ethereum addresses and Twitter profiles.

-   Sybil interface for governance: [https://sybil.org](https://sybil.org)
-   Sybil documentation: [https://github.com/Uniswap/sybil-list](https://github.com/Uniswap/sybil-list)
-   Interface repo: [https://github.com/Uniswap/sybil-interface](https://github.com/Uniswap/sybil-interface)
-   Read the Sybil announcement post : [https://uniswap.org/blog/sybil/](https://uniswap.org/blog/sybil/)

## Development

### Overview

This is a [cloudflare worker](https://developers.cloudflare.com/workers/) which exposes a minimal API to manage verification using Twitter and an Ethereum public key.

It uses the Rust library [didkit](https://github.com/spruceid/didkit) compiled to [WASM](https://github.com/cloudflare/rustwasm-worker-template) to create [verifiable credentials](https://www.w3.org/TR/vc-data-model/) allowing the worker to attest to the link in indentities.

It requires a [Twitter API](https://developer.twitter.com/en) bearer token and a [github access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with the permission to write to a hosted instance of a repository called `sybil-list`, [like this one](https://github.com/Uniswap/sybil-list).

#### Routes:

Two GET endpoints are defined:

`/api/verify?account=<ethereum_public_key>&id=<tweet_id>`:
Expects the query parameters of `account` and `id`. `account` corresponds to the public address used to sign the tweet, `id` is the signed tweet's id. Saves the result to a `sybil-list` repository's `verified.json`. Returns the handle if verified.

`/api/verifiable-credential?account=<ethereum_public_key>`:
Expects a query parameter `account`, returns a [verifiable credential](https://www.w3.org/TR/vc-data-model/) asserting that this worker attests to the connection between the Ethereum address and twitter handle. Uses the worker's [kv storage](https://developers.cloudflare.com/workers/learning/how-kv-works) to cache results after the first look up.

#### Install Dependencies

The Rust codebase depends on two libraries, `didkit` and `ssi`. Currently, the only way to require them is through the `path` key in the Cargo.toml. Cloning these two projects to the same directory as the Sybil Verifier is required.

From the directory containing the Sybil Verifier repo:

```bash
$ git clone https://github.com/spruceid/ssi.git
$ git clone https://github.com/spruceid/didkit.git
$ ls
didkit ssi sybil-verifier-worker
```

Though it should be compatible with the `main` branches going forward, the following revisions have been tested and verified to work with this repository:
`ssi`: `140639eb185b5e978c116cd0de5f808663ac2b14`
`didkit`: `0742c085a132f452bd17750dd9f849c2832b7122`

then, the JavaScript

```bash
$ cd sybil-verifier-worker
$ npm install
```

#### Configure Wrangler

You must create a file `wrangler.toml` with your cloudflare app information. See [wrangler-example.toml](./wrangler-example.toml) for setup. To get started,
```bash
$ cp wrangler-example.toml wrangler.toml
```
Then add your Cloudflare account id to the `account_id` field.

Next, create a [kv_namespace](https://developers.cloudflare.com/workers/learning/how-kv-works) called `VERIFIABLE_CREDENTIAL_STORE` by running:

```
$ wrangler kv:namespace create "VERIFIABLE_CREDENTIAL_STORE"
```

To have a preview version:

```
$ wrangler kv:namespace create "VERIFIABLE_CREDENTIAL_STORE"  --preview
```

Then, the output of the command needs to be added to the wrangler.toml, leaving an entry that would look like:

```
kv_namespaces = [
    { binding = "VERIFIABLE_CREDENTIAL_STORE", id = "<ID>", preview_id = "<PREVIEW_ID>" }
]
```

Note, the output of both commands (with and without `--preview`) will need to be combined if using the store for both preview and publishing.

More information about publishing your code can be found [in the documentation](https://workers.cloudflare.com/docs/quickstart/configuring-and-publishing/).

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.

#### Worker Environment:

The following [worker secrets](https://developers.cloudflare.com/workers/cli-wrangler/commands#secret) must be set

`GITHUB_AUTHENTICATION` A [github personal token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with access to write to a [sybil-list](https://github.com/Uniswap/sybil-list) repo.

`REPO_OWNER` The github username which hosts the corresponding [sybil-list](https://github.com/Uniswap/sybil-list) repo.

`TWITTER_BEARER` A [Twitter API](https://developer.twitter.com/en) Bearer Token.

`ISSUER_ADDRESS` The public key of an Ethereum address used to sign verifiable credentials (in hex, ex. `0xDA320a...38A9a9d`).

`SIGNING_KEY` The corresponding private key of the `ISSUER_ADDRESS` (in hex ex. `0xa85b047...c202ef`).

These can be set like so:

```bash
$ wrangler secret put ISSUER_ADDRESS
```

Which will prompt for the value to save to that environment variable. More information available [here](https://developers.cloudflare.com/workers/cli-wrangler/commands#put).

#### Run with Wrangler

Once you are ready, you can publish your code by running the following commands from the root of the repository:

```bash
$ npm run build
$ wrangler publish
```

To preview (at runtime will require the kv storage to be configured with a `preview_id`):

```bash
$ npm run build
$ wrangler preview
```
