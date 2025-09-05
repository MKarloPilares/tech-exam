use crate::models::token::TokenData;
use ethers::{
    prelude::*,
    providers::{Http, Provider},
    types::Address,
};
use std::sync::Arc;

abigen!(TestToken, "./src/abi/TestToken.json");

pub struct TokenService {
    provider: Arc<Provider<Http>>,
}

impl TokenService {
    pub fn new(rpc_url: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        Ok(Self {
            provider: Arc::new(provider),
        })
    }

    pub async fn get_token_data(&self, token_address: &str) -> Result<TokenData, Box<dyn std::error::Error>> {
        let address: Address = token_address.parse()?;

        let contract = TestToken::new(address, Arc::clone(&self.provider));

        let name = contract.name().call().await?;
        let symbol = contract.symbol().call().await?;
        let total_supply = contract.total_supply().call().await?;

        Ok(TokenData {
            address: token_address.to_string(),
            name,
            symbol,
            total_supply: total_supply.to_string(),
        })
    }
}