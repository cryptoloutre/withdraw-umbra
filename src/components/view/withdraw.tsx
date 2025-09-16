'use client';
import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getPersonnalPositionInfo } from "@/app/utils/getPersonnalPosition";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { fetchAllDigitalAssetByOwner, mplTokenMetadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { Pda, publicKey } from "@metaplex-foundation/umi";
import { Loader } from "../ui/Loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { PositionInfo } from "../PositionInfo";

export const Withdraw: FC = ({ }) => {
  const wallet = useWallet();
  const connection = new Connection("https://mainnetbeta-rpc.eclipse.xyz");
  const [connected, setConnected] = useState<boolean>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [userNFTs, setUserNFTs] = useState<PublicKey[]>([]);
  const [position, setPosition] = useState<PublicKey>();

  useEffect(() => {
    getUmbraNFTs(),
      setConnected(wallet.connected)
    setPosition(undefined)
  }, [wallet]);

  const getUmbraNFTs = async () => {
    if (wallet.publicKey) {
      setIsFetched(false);
      const umi = createUmi(connection);

      umi.use(mplTokenMetadata()).use(walletAdapterIdentity(wallet));
      const digitalAssets = await fetchAllDigitalAssetByOwner(umi, publicKey(wallet.publicKey.toBase58()));
      console.log(digitalAssets)
      const umbraNFTs: PublicKey[] = [];
      for (const asset of digitalAssets) {
        if (asset.metadata.name.includes("Umbra")) {
          umbraNFTs.push(new PublicKey(asset.publicKey))
        }
      }
      console.log(umbraNFTs)
      setUserNFTs(umbraNFTs)
      setIsFetched(true);
    }
  }

  return (
    <div className="md:hero mx-auto w-full p-4">

      <div className="text-center text-xl font-bold pb-4">Use <a
        className="underline"
        target="_blank"
        rel="noreferrer"
        href={`hhttps://backpack.app/`}>Backpack wallet</a> and connect you to the Eclipse Mainnet</div>
      {!connected && <div className="text-center font-bold mt-[5%] text-xl">Please, connect your wallet!</div>}

      {connected && !isFetched && <Loader text="Loading positions..." />}

      {connected && isFetched && userNFTs.length == 0 && position == null &&
        <div className="text-center">No position to withdraw</div>
      }

      {connected && isFetched && userNFTs.length != 0 && position == null &&
        <div className="mt-4 grid grid-cols-4 gap-4">
          {userNFTs.map((nft, key) => {
            {
              return (
                <Card key={key} className="flex justify-center border border-[#ffffff]">
                  <div>
                    <CardHeader className="mt-2 text-center mb-4">
                      <CardTitle>Position #{key + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <button onClick={() => setPosition(nft)} className="rounded-lg bg-[#312d29] border border-[#c8ab6e] px-2 py-2 font-bold">See Position</button>
                    </CardContent>
                  </div>
                </Card>
              )
            }
          })}
        </div>
      }

      {position != null &&
        <div>
          <button onClick={() => setPosition(undefined)} className="mt-4 rounded-lg bg-[#312d29] border border-[#c8ab6e] px-2 py-2 font-bold">Back</button>
          <PositionInfo mint={position} />

        </div>

      }

    </div >
  );
};
