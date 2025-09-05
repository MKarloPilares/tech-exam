use std::sync::Arc;
use ethers::prelude::*;
use ethers::providers::{Provider, Http, Middleware};
use crate::models::response::EthResponse;

pub async fn fetch_account_data(address: String) -> Result<EthResponse, Box<dyn std::error::Error>> {
    let rpc_url = std::env::var("ETH_RPC_URL")?;
    let provider = Arc::new(Provider::<Http>::try_from(rpc_url)?);

    let addr: Address = address.parse()?;

    let gas_price = provider.get_gas_price().await?;
    let block_number = provider.get_block_number().await?.as_u64();
    let balance = provider.get_balance(addr, None).await?;

    Ok(EthResponse {
        gas_price: gas_price.to_string(),
        block_number,
        balance: balance.to_string(),
    })
}