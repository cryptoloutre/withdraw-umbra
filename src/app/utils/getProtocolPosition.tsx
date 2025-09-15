import { PublicKey } from "@solana/web3.js";
import { UMBRA_PROGRAM_ID } from "./constants";
import { i32ToBytes } from "./i32ToBytes";

export async function getProtocolPosition(pool: PublicKey, tickLowerIndex: number, tickUpperIndex: number) {
    const [protocol] = PublicKey.findProgramAddressSync([Buffer.from(("position")), pool.toBuffer(), i32ToBytes(tickLowerIndex), i32ToBytes(tickUpperIndex)], UMBRA_PROGRAM_ID);

    return protocol
}