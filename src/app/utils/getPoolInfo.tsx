import { Connection, PublicKey } from "@solana/web3.js";
import * as borsh from 'borsh';

export async function getPoolInfo(pool: PublicKey, connection: Connection) {
    const info = await connection.getAccountInfo(pool)

    const data = info?.data;

    const tickSchema = {
        'struct': {
            'tick_spacing': 'u16',
        }
    }

    const tickDecoded = borsh.deserialize(tickSchema, data!.slice(235, 237));

    const mintSchema = {
        'struct': {
            'token_mint_0': { array: { type: 'u8', len: 32 } },
            'token_mint_1': { array: { type: 'u8', len: 32 } },
            'token_vault_0': { array: { type: 'u8', len: 32 } },
            'token_vault_1': { array: { type: 'u8', len: 32 } },
        }
    }

    const mintDecoded = borsh.deserialize(mintSchema, data!.slice(8 + 1 + 32 + 32, 8 + 1 + 32 + 32 + 4 * 32));

    const PoolInfo = {
        // @ts-expect-error
        tickSpacing: tickDecoded!.tick_spacing,
        // @ts-expect-error
        mint0: new PublicKey(mintDecoded!.token_mint_0),
        // @ts-expect-error
        mint1: new PublicKey(mintDecoded!.token_mint_1),
        // @ts-expect-error
        vaultTokenAccount0: new PublicKey(mintDecoded!.token_vault_0),
       // @ts-expect-error
        vaultTokenAccount1: new PublicKey(mintDecoded!.token_vault_1),
    }

    return PoolInfo
}