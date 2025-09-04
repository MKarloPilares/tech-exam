use axum::{ Router, routing::get };
use crate::services::eth;
use crate::models::response::EthResponse;
use axum::{extract::Path, response::Json};

pub fn router() -> Router {
    Router::new().route("/:address", get(get_account))
}

async fn get_account(Path(address): Path<String>) -> Json<EthResponse> {
    let data = eth::fetch_account_data(address).await;
    Json(data)
}