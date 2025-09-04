use std::sync::Arc;
use ethers::prelude::*;
use ethers::providers::{Provider, Http, Middleware};
use crate::models::response::EthResponse;

pub async fn fetch_account_data(address: String) -> EthResponse {
    let rpc_url = std::env::var("ETH_RPC_URL").expect("ETH_RPC_URL not set");
    let provider = Arc::new(Provider::<Http>::try_from(rpc_url).unwrap());

    let addr: Address = address.parse().expect("Invalid Ethereum address");

    let gas_price = provider.get_gas_price().await.unwrap();
    let block_number = provider.get_block_number().await.unwrap().as_u64();
    let balance = provider.get_balance(addr, None).await.unwrap();

    EthResponse {
        gas_price: gas_price.to_string(),
        block_number,
        balance: balance.to_string(),
    }
}