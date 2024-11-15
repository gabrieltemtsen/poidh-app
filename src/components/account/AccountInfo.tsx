'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

import { useGetChain } from '@/hooks/useGetChain';
import ClaimsListAccount from '@/components/bounty/ClaimListAccount';
import NftList from '@/components/bounty/NftList';
import BountyList from '@/components/ui/BountyList';
import { trpc } from '@/trpc/client';
import FilterButton from '@/components/ui/FilterButton';

type Section = 'nft' | 'bounties' | 'claims';

export default function AccountInfo({ address }: { address: string }) {
  const chain = useGetChain();
  const bounties = trpc.userBounties.useQuery(
    {
      address,
      chainId: chain.id.toString(),
    },
    {
      enabled: !!address,
    }
  );
  const claims = trpc.userClaims.useQuery(
    {
      address,
      chainId: chain.id.toString(),
    },
    {
      enabled: !!address,
    }
  );
  const NFTs = trpc.userNFTs.useQuery(
    {
      address,
      chainId: chain.id.toString(),
    },
    {
      enabled: !!address,
    }
  );

  const [currentSection, setCurrentSection] = useState<Section>('nft');

  const [ETHinContract, setETHinContract] = useState<string>('0');
  const [totalETHPaid, setTotalETHPaid] = useState<string>('0');
  const [totalETHEarn, setTotalETHEarn] = useState<string>('0');
  const [poidhScore, setPoidhScore] = useState<number>(0);

  useEffect(() => {
    let totalAmount = BigInt(0);
    bounties.data
      ?.filter((bounty) => !bounty.inProgress)
      .forEach((bounty) => {
        totalAmount += BigInt(bounty.amount);
      });
    setTotalETHPaid(formatEther(totalAmount));
    totalAmount = BigInt(0);
    bounties.data
      ?.filter((bounty) => bounty.inProgress)
      .forEach((bounty) => {
        totalAmount += BigInt(bounty.amount);
      });
    setETHinContract(formatEther(totalAmount));
  }, [bounties]);

  useEffect(() => {
    const totalAmount =
      claims.data
        ?.filter((claim) => claim.accepted)
        .flatMap((claim) => claim.bounty.amount)
        .reduce((prev, curr) => BigInt(prev) + BigInt(curr), BigInt(0)) ||
      BigInt(0);
    setTotalETHEarn(formatEther(totalAmount));
  }, [claims]);

  useEffect(() => {
    const poidhScore =
      Number(totalETHEarn) * 1000 +
      Number(totalETHPaid) * 1000 +
      (NFTs.data?.length ?? 0) * 10;
    setPoidhScore(Number(poidhScore.toFixed(2)));
  }, [totalETHEarn, totalETHPaid, NFTs]);

  return (
    <>
      {address && (
        <div>
          <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start p-8'>
            <div>
              <div className='flex flex-col border-b border-dashed'>
                <span>user</span>
                <span className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'>
                  {formatAddress(address)}
                </span>
              </div>
              <div className='flex flex-col'>
                <div>
                  completed bounties:{' '}
                  <span className='font-bold'> {NFTs.data?.length ?? 0}</span>
                </div>
                <div>
                  total {chain.currency} paid:{' '}
                  <span className='font-bold'>{totalETHPaid}</span>{' '}
                </div>
                <div>
                  in progress bounties:{' '}
                  <span className='font-bold'>
                    {bounties.data?.length ?? 0}
                  </span>{' '}
                </div>
                <div>
                  total {chain.currency} in contract:{' '}
                  <span className='font-bold'>{ETHinContract}</span>{' '}
                </div>
                <div>
                  completed claims:{' '}
                  <span className='font-bold'>
                    {claims.data?.filter((claim) => claim.accepted).length ?? 0}
                  </span>
                </div>
                <div>
                  total {chain.currency} earned:{' '}
                  <span className='font-bold'>{totalETHEarn}</span>
                </div>
              </div>
            </div>
            <div className='flex flex-col '>
              <span>poidh score:</span>
              <span className='text-4xl text-[#F15E5F] border-y border-dashed'>
                {poidhScore}
              </span>
            </div>
          </div>

          <div className='flex flex-row overflow-x-scroll items-center py-12 border-b border-white lg:justify-center gap-x-5 '>
            <FilterButton
              onClick={() => setCurrentSection('nft')}
              show={currentSection !== 'nft'}
            >
              NFTs ({NFTs.data?.length ?? 0})
            </FilterButton>
            <FilterButton
              onClick={() => setCurrentSection('bounties')}
              show={currentSection !== 'bounties'}
            >
              bounties ({bounties.data?.length ?? 0})
            </FilterButton>
            <FilterButton
              onClick={() => setCurrentSection('claims')}
              show={currentSection !== 'claims'}
            >
              claims ({claims.data?.length ?? 0})
            </FilterButton>
          </div>

          <div>
            {currentSection === 'nft' && (
              <div className='lg:px-20 px-8'>
                <NftList NFTs={NFTs.data ?? []} />
              </div>
            )}
            {currentSection === 'bounties' && (
              <BountyList bounties={bounties.data ?? []} />
            )}
            {currentSection === 'claims' && (
              <div className='lg:px-20 px-8'>
                <ClaimsListAccount
                  claims={
                    claims.data?.map((claim) => {
                      return {
                        id: claim.primaryId.toString(),
                        title: claim.title,
                        description: claim.description,
                        issuer: claim.issuer.id,
                        bountyId: claim.bounty.primaryId.toString(),
                        accepted: Boolean(claim.accepted),
                        url: claim.url,
                      };
                    }) ?? []
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
