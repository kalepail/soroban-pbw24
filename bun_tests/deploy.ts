import { $ } from 'bun'

await $`rm -rf ./target/wasm32-unknown-unknown/release/`.cwd("../")
await $`soroban contract build`.cwd("../")
await $`soroban contract optimize --wasm ./target/wasm32-unknown-unknown/release/hello_world.wasm`.cwd("../")

await $`soroban keys generate pbw24 --network local`
await $`soroban keys fund pbw24 --network local`
const contractId = (await $`soroban contract deploy --wasm ../target/wasm32-unknown-unknown/release/hello_world.optimized.wasm --network local --source pbw24`.text()).replace(/\W/g, '')
console.log(contractId);

await $`soroban contract bindings typescript --output-dir ./hello-world-sdk --network local --contract-id ${contractId} --overwrite`

await $`bun install --force`

const secret = (await $`soroban keys show pbw24`.text()).replace(/\W/g, '')

let file = ``
file += `CONTRACT_ID=${contractId}\n`
file += `SECRET=${secret}`

await Bun.write('.env.local', file);
console.log('✅')