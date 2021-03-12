## Sybil Verifier

This is a verifier used by the Sybil interface for verifying links between Ethereum addresses and Twitter profiles.

-   Sybil interface for governance: [https://sybil.org]https://sybil.org)
-   Sybil documentation: [https://github.com/Uniswap/sybil-list](https://github.com/Uniswap/sybil-list)
-   Interface repo: [https://github.com/Uniswap/sybil-interface](https://github.com/Uniswap/sybil-interface)
-   Read the Sybil announcement post : [https://uniswap.org/blog/sybil/](https://uniswap.org/blog/sybil/)

## Development

#### Install Dependencies

```bash
npm install
```

#### Run with Wrangler

You must create a file `wrangler.toml` with your cloudflare app information. See [wrangler-example.toml](./wrangler-example.toml) for setup.

You can use [wrangler](https://github.com/cloudflare/wrangler) to generate a new Cloudflare Workers project based on this template by running the following command from your terminal:

```
wrangler generate myapp https://github.com/cloudflare/rustwasm-worker-template.git
```

Before publishing your code you need to edit `wrangler.toml` file and add your Cloudflare `account_id` - more information about publishing your code can be found [in the documentation](https://workers.cloudflare.com/docs/quickstart/configuring-and-publishing/).

Once you are ready, you can publish your code by running the following command:

```
./publish.sh
```

To work with changes locally before publishing run

```
./preview.sh
```

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.

#### Worker Environment:

The following must be set
`TWITTER_BEARER` A Twitter API Bearer Token
`ISSUER_ADDRESS` The public key of an ethereum address used to sign verifiable credentials (in hex)
`SIGNING_KEY` The corresponding private key of the `ISSUER_ADDRESS` (in hex as well)

Also a key value namespace needs to be bound. This can be done with the command:

```
$ wrangler kv:namespace create "VERFIABLE_CREDENTIAL_STORE"
```

To have a preview version:

```
$ wrangler kv:namespace create "VERFIABLE_CREDENTIAL_STORE"  --preview
```

Then, the output of the command needs to be added to the wrangler.toml, leaving an entry that would look like:

```
kv_namespaces = [
    { binding = "VERIFIABLE_CREDENTIAL_STORE", id = "<SOME_UUID>", preview_id = "<SOME_UUID>" }
]
```

Note, the output of both commands (with and without `--preview`) will need to be combined if using the store for both preview and publishing

#### Migration from Github Hosted JSON to KV Store

See `migration/README.md`
