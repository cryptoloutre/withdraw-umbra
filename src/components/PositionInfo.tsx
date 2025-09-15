import { UMBRA_PROGRAM_ID } from "@/app/utils/constants";
import { getPersonnalPositionInfo } from "@/app/utils/getPersonnalPosition";
import { getPoolInfo } from "@/app/utils/getPoolInfo";
import { getProtocolPosition } from "@/app/utils/getProtocolPosition";
import { getTickPDA } from "@/app/utils/getTickPDA";
import { MEMO_PROGRAM_ID, SYSTEM_PROGRAM_ID } from "@raydium-io/raydium-sdk-v2";
import { createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { Buffer } from "buffer";

type Props = {
    mint: PublicKey;
};

export const PositionInfo: FC<Props> = (prop) => {
    const wallet = useWallet();
    const connection = new Connection("https://mainnetbeta-rpc.eclipse.xyz");
    const [positionInfo, setPositionInfo] = useState<{
        address: PublicKey;
        poolID: PublicKey;
        tickLowerIndex: any;
        tickUpperIndex: any;
        liquidity: number;
    }>();
    const [signature, setSignature] = useState<string>("");

    useEffect(() => {
        getInfo()
    }, []);

    const getInfo = async () => {
        const positionInfo = await getPersonnalPositionInfo(prop.mint, connection);
        setPositionInfo(positionInfo)
    }

    const withdraw = async () => {
        if (wallet.connected && wallet.publicKey) {
            const poolInfo = await getPoolInfo(positionInfo!.poolID, connection);
            const protocolPosition = await getProtocolPosition(positionInfo!.poolID, positionInfo?.tickLowerIndex, positionInfo?.tickUpperIndex);
            const tickPDA = await getTickPDA(positionInfo!.poolID, poolInfo.tickSpacing, positionInfo?.tickLowerIndex, positionInfo?.tickUpperIndex);

            let programID0;
            let programID1;

            if (poolInfo.mint0.toBase58() == "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn") {
                programID0 = TOKEN_2022_PROGRAM_ID;
            }
            else {
                programID0 = TOKEN_PROGRAM_ID
            }

            if (poolInfo.mint1.toBase58() == "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn") {
                programID1 = TOKEN_2022_PROGRAM_ID;
            }
            else {
                programID1 = TOKEN_PROGRAM_ID
            }

            const userTokenAccount0 = getAssociatedTokenAddressSync(
                poolInfo.mint0,
                wallet.publicKey,
                false,
                programID0
            )

            const userTokenAccount1 = getAssociatedTokenAddressSync(
                poolInfo.mint1,
                wallet.publicKey,
                false,
                programID1
            )

            const NFTTokenAccount = getAssociatedTokenAddressSync(prop.mint, wallet.publicKey)

            const createTokenAccount0Ix = createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, userTokenAccount0, wallet.publicKey, poolInfo.mint0, programID0);
            const createTokenAccount1Ix = createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, userTokenAccount1, wallet.publicKey, poolInfo.mint1, programID1);

            const withdrawInstructionData = Buffer.alloc(8 + 16 + 8 + 8);
            const liquidity = BigInt(positionInfo?.liquidity!)

            withdrawInstructionData.writeUInt8(58, 0);
            withdrawInstructionData.writeUInt8(127, 1);
            withdrawInstructionData.writeUInt8(188, 2);
            withdrawInstructionData.writeUInt8(62, 3);
            withdrawInstructionData.writeUInt8(79, 4);
            withdrawInstructionData.writeUInt8(82, 5);
            withdrawInstructionData.writeUInt8(196, 6);
            withdrawInstructionData.writeUInt8(96, 7);
            withdrawInstructionData.writeBigUInt64LE(liquidity, 8)
            withdrawInstructionData.writeBigUInt64LE(0n, 16);
            withdrawInstructionData.writeBigUInt64LE(0n, 24);

            const withdrawIx: TransactionInstruction = {
                programId: UMBRA_PROGRAM_ID,
                keys: [
                    {
                        pubkey: wallet.publicKey,
                        isSigner: true,
                        isWritable: true
                    },
                    {
                        pubkey: NFTTokenAccount,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: positionInfo?.address!,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: positionInfo?.poolID!,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: protocolPosition,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: poolInfo.vaultTokenAccount0,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: poolInfo.vaultTokenAccount1,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: tickPDA.lowerTick,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: tickPDA.upperTick,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: userTokenAccount0,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: userTokenAccount1,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: TOKEN_PROGRAM_ID,
                        isSigner: false,
                        isWritable: false,
                    },
                    {
                        pubkey: TOKEN_2022_PROGRAM_ID,
                        isSigner: false,
                        isWritable: false,
                    },
                    {
                        pubkey: MEMO_PROGRAM_ID,
                        isSigner: false,
                        isWritable: false,
                    },
                    {
                        pubkey: poolInfo.mint0,
                        isSigner: false,
                        isWritable: false,
                    },
                    {
                        pubkey: poolInfo.mint1,
                        isSigner: false,
                        isWritable: false,
                    }

                ],
                data: withdrawInstructionData
            }

            const closeInstructionData = Buffer.alloc(8);

            closeInstructionData.writeUInt8(123, 0);
            closeInstructionData.writeUInt8(134, 1);
            closeInstructionData.writeUInt8(81, 2);
            closeInstructionData.writeUInt8(0, 3);
            closeInstructionData.writeUInt8(49, 4);
            closeInstructionData.writeUInt8(68, 5);
            closeInstructionData.writeUInt8(98, 6);
            closeInstructionData.writeUInt8(98, 7);

            const closeIx: TransactionInstruction = {
                programId: UMBRA_PROGRAM_ID,
                keys: [
                    {
                        pubkey: wallet.publicKey,
                        isSigner: true,
                        isWritable: true
                    },
                    {
                        pubkey: prop.mint,
                        isSigner: false,
                        isWritable: true
                    },
                    {
                        pubkey: NFTTokenAccount,
                        isSigner: false,
                        isWritable: true
                    },
                    {
                        pubkey: positionInfo?.address!,
                        isSigner: false,
                        isWritable: true
                    },
                    {
                        pubkey: SYSTEM_PROGRAM_ID,
                        isSigner: false,
                        isWritable: false,
                    },
                    {
                        pubkey: TOKEN_PROGRAM_ID,
                        isSigner: false,
                        isWritable: false,
                    },
                ],
                data: closeInstructionData

            }

            const tx = new Transaction().add(createTokenAccount0Ix, createTokenAccount1Ix)
            if (liquidity != 0n) {
                tx.add(withdrawIx)
            }
            tx.add(closeIx);

            const signature = await wallet.sendTransaction(tx, connection)
            console.log(signature)
            setSignature(signature)
        }

    }


    return (
        <div className="flex flex-col justify-center items-center text-xl font-light">
            {positionInfo != null &&

                <div className="">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://eclipsescan.xyz/account/${positionInfo.poolID.toBase58()}`}
                        className="font-bold">Pool: <span className="underline">{positionInfo.poolID.toBase58()}</span>
                    </a>
                    <div className="mt-2">Liquidity: {positionInfo.liquidity}</div>
                    <button onClick={() => withdraw()} className="mt-2 rounded-lg bg-[#312d29] border border-[#c8ab6e] px-2 py-2 font-bold">Withdraw</button>

                    {signature != "" && <div className="mt-4">Success: check your transaction <a className="underline" target="_blank"
                        rel="noreferrer"
                        href={`https://eclipsescan.xyz/tx/${signature}`}>here</a></div>}
                </div>}
        </div>
    );
};