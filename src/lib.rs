use core::future::Future;

use js_sys::Promise;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

use didkit::error::Error;
#[cfg(doc)]
use didkit::error::{didkit_error_code, didkit_error_message};
use didkit::LinkedDataProofOptions;
use didkit::ProofPreparation;
use didkit::VerifiableCredential;
use didkit::JWK;

pub static VERSION: &str = env!("CARGO_PKG_VERSION");

fn map_async_jsvalue(future: impl Future<Output = Result<String, Error>> + 'static) -> Promise {
    future_to_promise(async {
        match future.await {
            Ok(string) => Ok(string.into()),
            Err(err) => Err(err.to_string().into()),
        }
    })
}

async fn prepare_issue_credential(
    credential: String,
    linked_data_proof_options: String,
    public_key: String,
) -> Result<String, Error> {
    let public_key: JWK = serde_json::from_str(&public_key)?;
    let credential = VerifiableCredential::from_json_unsigned(&credential)?;
    let options: LinkedDataProofOptions = serde_json::from_str(&linked_data_proof_options)?;
    let preparation = credential.prepare_proof(&public_key, &options).await?;
    let preparation_json = serde_json::to_string(&preparation)?;
    Ok(preparation_json)
}

#[wasm_bindgen]
#[allow(non_snake_case)]
#[cfg(feature = "issue")]
pub fn prepareIssueCredential(
    credential: String,
    linked_data_proof_options: String,
    public_key: String,
) -> Promise {
    map_async_jsvalue(prepare_issue_credential(
        credential,
        linked_data_proof_options,
        public_key,
    ))
}

async fn complete_issue_credential(
    credential: String,
    preparation: String,
    signature: String,
) -> Result<String, Error> {
    let mut credential = VerifiableCredential::from_json_unsigned(&credential)?;
    let preparation: ProofPreparation = serde_json::from_str(&preparation)?;
    let proof = preparation.complete(&signature).await?;
    credential.add_proof(proof);
    let vc_json = serde_json::to_string(&credential)?;
    Ok(vc_json)
}

#[wasm_bindgen]
#[allow(non_snake_case)]
#[cfg(feature = "issue")]
pub fn completeIssueCredential(
    credential: String,
    preparation: String,
    signature: String,
) -> Promise {
    map_async_jsvalue(complete_issue_credential(
        credential,
        preparation,
        signature,
    ))
}
