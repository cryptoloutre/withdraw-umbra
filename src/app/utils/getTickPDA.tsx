import { Connection, PublicKey } from "@solana/web3.js";
import { TickUtils } from "@raydium-io/raydium-sdk-v2";
import { i32ToBytes } from "./i32ToBytes";
import { UMBRA_PROGRAM_ID } from "./constants";

export async function getTickPDA(pool: PublicKey, spacing: number, lowerIndex: number, upperIndex: number) {

    const tickArrayLowerStartIndex = TickUtils.getTickArrayStartIndexByTick(
        lowerIndex,
        spacing
    );

    const [lower] = PublicKey.findProgramAddressSync([Buffer.from("tick_array"), pool.toBuffer(), i32ToBytes(tickArrayLowerStartIndex)], UMBRA_PROGRAM_ID);

    const tickArrayUpperStartIndex = TickUtils.getTickArrayStartIndexByTick(
        upperIndex,
        spacing
    );

    const [upper] = PublicKey.findProgramAddressSync([Buffer.from("tick_array"), pool.toBuffer(), i32ToBytes(tickArrayUpperStartIndex)], UMBRA_PROGRAM_ID);

    const tickPDA = {
        lowerTick: lower,
        upperTick: upper
    }

    return tickPDA

}