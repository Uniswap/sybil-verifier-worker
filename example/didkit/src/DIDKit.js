/* global window */
"use strict";

import init, * as DIDKit from "didkit-wasm";

let loaded;
// TODO: This isn't a perfect loading method, we grab it once at build time,
// and again at runtime. Getting a 404 under other methods.
export default async function loadDIDKit(url = "/pkg/didkit_wasm_bg.wasm") {
  if (loaded) return DIDKit;
  try {
    await init(url);
  } catch(e) {
    let err = new Error('Unable to load DIDKit: ' + e.message);
    err.stack = e.stack;
    throw err;
  }
  loaded = true;
  window.DIDKit = DIDKit;
  return DIDKit;
}
