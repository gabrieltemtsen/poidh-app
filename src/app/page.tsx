'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { cn } from '@/utils';
import BountyList from '@/components/bounty/BountyList';
import { BountyDisplayType, BountySortType, ChainId } from '@/utils/types';
import { getChainById } from '@/utils/config';
import PastBountyCard from '@/components/bounty/PastBountyCard';
import NavBarMobile from '@/components/global/NavBarMobile';
import CreateBounty from '@/components/bounty/CreateBounty';
import { useScreenSize } from '@/hooks/useScreenSize';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [display, setDisplay] = useState<BountyDisplayType>('open');
  const [sortType, setSortType] = useState<BountySortType>('value');
  const isMobile = useScreenSize();

  // Fetch bounties from all 3 chains
  const degenBounties = trpc.bounties.useQuery({
    chainId: 666666666, // Degen
    status: display,
    sortType,
    limit: 7,
  });

  const baseBounties = trpc.bounties.useQuery({
    chainId: 8453, // Base
    status: display,
    sortType,
    limit: 7,
  });

  const arbitrumBounties = trpc.bounties.useQuery({
    chainId: 42161, // Arbitrum
    status: display,
    sortType,
    limit: 6,
  });

  // Combine and sort all bounties
  const allBounties = React.useMemo(() => {
    if (
      !degenBounties.data?.items ||
      !baseBounties.data?.items ||
      !arbitrumBounties.data?.items
    ) {
      return { items: [] };
    }

    const combined = [
      ...degenBounties.data.items,
      ...baseBounties.data.items,
      ...arbitrumBounties.data.items,
    ];

    // Sort by value (amount_sort) or id based on sortType
    const sorted = combined.sort((a, b) => {
      if (sortType === 'value') {
        return b.amount_sort - a.amount_sort;
      } else {
        return b.id - a.id;
      }
    });

    return { items: sorted.slice(0, 20) };
  }, [degenBounties.data, baseBounties.data, arbitrumBounties.data, sortType]);

  return (
    <>
      <div>
        <div className='container mx-auto text-center my-6 mt-8'>
          <h1 className='font-mono text-4xl'>poidh</h1>
          <h3 className='font-mono text-2xl mt-4 mb-8 tracking-wide'>
            you can just incentivize things
          </h3>
        </div>
        <div className='z-1 flex flex-wrap container mx-auto border-b border-white hover:border-white py-6 md:pb-12 sm:pb-8 pt-4 w-full items-center justify-center px-8'>
          <div
            id='btn-container'
            className={cn(
              'flex flex-nowrap border border-white rounded-full transition-all bg-gradient-to-r h-[42px]',
              'md:text-base sm:text-sm text-xs',
              display == 'open' && 'from-red-500 to-40%',
              display == 'progress' &&
                'via-red-500 from-transparent to-transparent from-[23.33%] to-[76.66%]',
              display == 'past' && 'from-transparent from-60% to-red-500',
              'gap-2 md:gap-4'
            )}
          >
            <button
              onClick={() => setDisplay('open')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              new bounties
            </button>
            <button
              onClick={() => setDisplay('progress')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              voting in progress
            </button>
            <button
              onClick={() => setDisplay('past')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              past bounties
            </button>
          </div>
        </div>

        {display !== 'past' && (
          <div className='container mx-auto px-8 py-4'>
            <div className='flex justify-end items-center'>
              <div className='flex items-center gap-2'>
                <span className='text-white/60 text-sm'>Sort:</span>
                <Select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(e.target.value as BountySortType)
                  }
                  variant='outlined'
                  size='small'
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                    fontSize: '14px',
                  }}
                >
                  <MenuItem value='value'>by value</MenuItem>
                  <MenuItem value='id'>by date</MenuItem>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className='pb-20 z-1 mt-7'>
          {allBounties.items.length > 0 ? (
            display !== 'past' ? (
              <BountyList
                key={(allBounties.items[0]?.id ?? 'empty-list').toString()}
                bounties={allBounties.items.map((bounty) => ({
                  id: bounty.id.toString(),
                  chainId: bounty.chain_id as ChainId,
                  network: getChainById({ chainId: bounty.chain_id as ChainId })
                    .name,
                  title: bounty.title,
                  description: bounty.description,
                  amount: bounty.amount,
                  isMultiplayer: bounty.is_multiplayer || false,
                  inProgress: bounty.in_progress || false,
                  isCanceled: bounty.is_canceled || false,
                  hasClaims: bounty.claims.length > 0,
                }))}
                showChainIcon={true}
              />
            ) : (
              <div className='container mx-auto p-4 flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-0'>
                {allBounties.items.map((bounty) => {
                  const claim = bounty.claims.find((c) => c.is_accepted);
                  if (!claim) return null;
                  return (
                    <PastBountyCard
                      key={`${claim.id}-${claim.chain_id}`}
                      claim={{
                        id: claim.id.toString(),
                        title: claim.title,
                        description: claim.description,
                        url: claim.url ?? '',
                        issuer: claim.issuer,
                        bountyId: claim.bounty_id.toString(),
                        chainId: claim.chain_id as ChainId,
                        accepted: true,
                      }}
                      bountyTitle={bounty.title}
                      bountyAmount={bounty.amount}
                      isMultiplayer={bounty.is_multiplayer || false}
                    />
                  );
                })}
              </div>
            )
          ) : (
            <div className='container mx-auto p-4 flex items-center justify-center mt-24'>
              <div className='text-white/60 text-center'>
                No{' '}
                {display === 'open'
                  ? 'active'
                  : display === 'past'
                  ? 'past'
                  : ''}{' '}
                bounties {display === 'progress' ? 'in voting' : ''} found
              </div>
            </div>
          )}
        </div>
      </div>
      {isMobile ? (
        <NavBarMobile type='bounty' showChainSelector={true} />
      ) : (
        <CreateBounty showChainSelector={true} />
      )}
    </>
  );
}
