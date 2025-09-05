use axum::{Router, routing::get, extract::Path, response::Json, http::StatusCode};
use crate::services::eth;
use crate::models::response::EthResponse;

pub fn router() -> Router {
    Router::new().route("/:address", get(get_account))
}

async fn get_account(Path(address): Path<String>) -> Result<Json<EthResponse>, StatusCode> {
    match eth::fetch_account_data(address).await {
        Ok(data) => Ok(Json(data)),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}