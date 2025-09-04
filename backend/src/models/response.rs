use serde::Serialize;

#[derive(Serialize)]
pub struct EthResponse {
    pub gas_price: String,
    pub block_number: u64,
    pub balance: String,
}