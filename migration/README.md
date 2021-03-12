### Migration from Github Hosted JSON File to Worker KV Store.

The KV store is arranged in the style as the JSON file stored [here](https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json):
Ethereum addresses are the keys, the values look like:

```javascript
{
    twitter: {
        tweetID: string,
        timestamp: int,
        handle: string
    }
}
```

To run the migration script, 2 variables must be set
`WORKER_HOST`: The url base of the worker, ex. https://worker_name.cloudflare_domain.workers.dev
`SIGNING_KEY`: The same signing key used by the worker. This is used to prevent an arbitrary attacker from inserting unverified VCs.

#### Set up and run migration

From the root of the repo:

```
$ cd migration
$ npm i
$ WORKER_HOST=<the location of the worker> SIGNING_KEY=<the worker's signing key> node migration.js
```

It will log any errors encountered and may take a good stretch of time.
