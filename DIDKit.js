/* global window */
"use strict";

import init, * as DIDKit from "didkit-wasm";

let loaded;
export default async function loadDIDKit(url = "/didkit_wasm_bg.wasm") {
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
