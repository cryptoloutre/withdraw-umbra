import { Connection, PublicKey } from "@solana/web3.js";
import { UMBRA_PROGRAM_ID } from "./constants";
import * as borsh from 'borsh';

export async function getPersonnalPositionInfo(mint: PublicKey, connection: Connection) {
    const [personal] = PublicKey.findProgramAddressSync([Buffer.from(("position")), mint.toBuffer()], UMBRA_PROGRAM_ID);

    const info = await connection.getAccountInfo(personal);
    const data = info?.data;

    const schema = {
        'struct': {
            'bump': 'u8',
            'nft_mint': { array: { type: 'u8', len: 32 } },
            'pool_id': { array: { type: 'u8', len: 32 } },
            'tick_lower_index': 'i32',
            'tick_upper_index': 'i32',
            'liquidity': 'u128',
        }
    }

    const decoded = borsh.deserialize(schema, data!.slice(8, 8 + 1 + 32 + 32 + 8 + 8 + 16));

    const PersonnalPositionInfo = {
        address: personal,
       // @ts-ignore
        poolID: new PublicKey(decoded!.pool_id),
        // @ts-ignore
        tickLowerIndex: decoded!.tick_lower_index,
        // @ts-ignore
        tickUpperIndex: decoded!.tick_upper_index,
        // @ts-ignore
        liquidity: decoded!.liquidity
    }

    return PersonnalPositionInfo
}