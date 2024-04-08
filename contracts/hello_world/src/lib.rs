#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
    pub fn increment(env: Env) -> u32 {
        let key = symbol_short!("counter");

        let value = env
            .storage()
            .instance()
            .get::<Symbol, u32>(&key)
            .unwrap_or(0)
            + 1;

        env.storage().instance().set(&key, &value);

        value
    }
    pub fn owned_increment(env: Env, source: Address) -> u32 {
        source.require_auth();

        let key = (symbol_short!("counter"), source);

        let value = env
            .storage()
            .instance()
            .get::<(Symbol, Address), u32>(&key)
            .unwrap_or(0)
            + 1;

        env.storage().instance().set(&key, &value);

        value
    }
}

mod test;
