use axum::Router;
use std::{net::SocketAddr};
use tokio::net::TcpListener;

mod routes;
mod models;
mod services;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    let app = Router::new()
        .nest("/eth", routes::eth::router());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at  http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
