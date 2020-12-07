## Sybil Verifier 

This is a verifier used by the Sybil interface for verifying links between Ethereum addresses and Twitter profiles. 

- Sybil interface for governance: [https://sybil-interface.vercel.app/#/delegates/uniswap](https://sybil-interface.vercel.app/#/delegates/uniswap)
- Sybil documentation: [https://github.com/Uniswap/sybil-list](https://github.com/Uniswap/sybil-list)
- Interface repo: [https://github.com/Uniswap/sybil-interface](https://github.com/Uniswap/sybil-interface)
- Read the Sybil announcement post : [link to post]()

## Development

#### Install Dependencies

```bash
npm install
```

#### Run with Wrangler

You must create a file `wrangler.toml` with your cloudflare app information. See [wrangler-example.toml](./wrangler-example.toml) for setup. 

You can use [wrangler](https://github.com/cloudflare/wrangler) to generate a new Cloudflare Workers project based on this template by running the following command from your terminal:

```
wrangler generate myapp https://github.com/cloudflare/worker-template-router
```

Before publishing your code you need to edit `wrangler.toml` file and add your Cloudflare `account_id` - more information about publishing your code can be found [in the documentation](https://workers.cloudflare.com/docs/quickstart/configuring-and-publishing/).

Once you are ready, you can publish your code by running the following command:

```
wrangler publish
```

To work with changes locally before publishing run 

```
wrangler preview --watch  
```

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.


