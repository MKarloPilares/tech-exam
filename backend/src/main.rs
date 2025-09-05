use axum::Router;
use std::{net::SocketAddr};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

mod routes;
mod models;
mod services;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    let app = Router::new()
        .nest("/api/eth", routes::eth::router())
        .nest("/api/token", routes::token::router())
        .layer(CorsLayer::permissive());

    let address = std::env::var("ADDRESS").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from((address.parse::<std::net::IpAddr>().expect("Invalid IP address"), port));
    println!("Server running at  http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
