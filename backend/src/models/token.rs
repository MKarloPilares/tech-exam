use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenData {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub total_supply: String,
}
