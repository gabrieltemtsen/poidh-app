import { withdrawFromOpenBounty } from '@/app/context/web3';
import { useGetChain } from '@/hooks/useGetChain';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import React from 'react';
import { toast } from 'react-toastify';

export default function Withdraw({ bountyId }: { bountyId: string }) {
  const { primaryWallet } = useDynamicContext();
  const chain = useGetChain();

  const handlewithdrawFromOpenBounty = async () => {
    if (!primaryWallet) {
      toast.error('Please fill in all fields and connect wallet');
      return;
    }
    try {
      await withdrawFromOpenBounty({
        chainName: chain.chainPathName,
        id: bountyId,
        wallet: primaryWallet,
      });
      toast.success('Withdraw successful!');
    } catch (error: any) {
      if (error.info?.error?.code !== 4001) {
        toast.error('Withdraw failed');
      }
    }
  };

  return (
    <div className=' py-12 w-fit '>
      <button
        className='border border-white rounded-full px-5 py-2  backdrop-blur-sm bg-white/30 '
        onClick={handlewithdrawFromOpenBounty}
      >
        {' '}
        withdraw{' '}
      </button>
    </div>
  );
}
