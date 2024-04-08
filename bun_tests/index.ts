import { parseArgs } from 'util'
import { Client, Keypair, StrKey, Transaction, hash, networks } from 'hello-world-sdk'

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        secret: {
            type: 'string',
        },
    },
    strict: true,
    allowPositionals: true
});

const keypair = Keypair.fromSecret(Bun.env.SECRET)
const pubkey = keypair.publicKey()

const contract = new Client({
    ...networks.standalone,
    rpcUrl: 'http://localhost:8000/soroban/rpc',
    publicKey: pubkey,
    allowHttp: true,
    async signTransaction(xdr) {
        const transaction = new Transaction(xdr, networks.standalone.networkPassphrase)

        transaction.sign(keypair);

        return transaction.toXDR();
    }
})

// Hello
const { result: helloRes } = await contract.hello({
    to: 'World'
})

console.log(helloRes, '\n');
////

// Increment
const { signAndSend: incrementSignAndSend } = await contract.increment()

const { result: incrementRes } = await incrementSignAndSend()

console.log(incrementRes, '\n');
////

// Owned Increment
const sourceKeypair = values.secret && StrKey.isValidEd25519SecretSeed(values.secret) ? Keypair.fromSecret(values.secret) : Keypair.random()
const sourcePubkey = sourceKeypair.publicKey()
console.log(sourcePubkey);

await fetch(`http://localhost:8000/friendbot?addr=${sourcePubkey}`)

const { signAndSend: ownedIncrementSignAndSend, signAuthEntries } = await contract.owned_increment({
    source: sourcePubkey
})

await signAuthEntries({
    publicKey: sourcePubkey,
    async signAuthEntry(xdr) {
        return sourceKeypair
            .sign(hash(Buffer.from(xdr, 'base64')))
            .toString('base64')
    }
})

const { result: ownedIncrementRes } = await ownedIncrementSignAndSend()

console.log(ownedIncrementRes);
////