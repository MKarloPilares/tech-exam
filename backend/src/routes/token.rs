use axum::{Router, routing::get, extract::Path, http::StatusCode, response::Json};
use crate::{models::token::TokenData, services::token::TokenService};

pub fn router() -> Router {
    Router::new().route("/:address", get(get_token_data))
}

pub async fn get_token_data(Path(address): Path<String>) -> Result<Json<TokenData>, StatusCode> {
    let rpc_url = std::env::var("ETH_RPC_URL")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let token_service = TokenService::new(&rpc_url)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match token_service.get_token_data(&address).await {
        Ok(token_data) => Ok(Json(token_data)),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}