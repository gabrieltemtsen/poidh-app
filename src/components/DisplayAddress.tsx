import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDegenOrEnsName } from '@/utils/web3';
import Link from 'next/link';
import { Chain } from '@/utils/types';
import { toast } from 'react-toastify';
import { CopyDoneIcon, CopyIcon } from '@/components/global/Icons';

export default function DisplayAddress({
  chain,
  address,
}: {
  chain: Chain;
  address: string;
}) {
  const [isCopied, setCopied] = useState(false);

  const walletDisplayName = useQuery({
    queryKey: ['getWalletDisplayName', address, chain.slug],
    queryFn: () =>
      getWalletDisplayName({
        address: address,
        chainName: chain.slug,
      }),
  });

  return (
    <div className='flex items-center lg:w-[29ch] w-[15ch]'>
      <Link
        href={`/${chain.slug}/account/${address}`}
        className=' hover:text-gray-200 max-w-[29ch]'
      >
        {walletDisplayName.data ?? address}
      </Link>
      <span
        onClick={() => {
          setCopied(true);
          navigator.clipboard.writeText(address);
          toast.success('Address copied to clipboard');
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        }}
        className='ml-2 cursor-pointer hover:text-gray-200'
      >
        {isCopied ? (
          <CopyDoneIcon width={20} height={20} />
        ) : (
          <CopyIcon width={20} height={20} />
        )}
      </span>
    </div>
  );
}

async function getWalletDisplayName({
  address,
  chainName,
}: {
  address: string;
  chainName: 'arbitrum' | 'base' | 'degen';
}) {
  const nickname = await getDegenOrEnsName({ address, chainName });
  if (nickname) {
    return nickname;
  }

  return address.slice(0, 6) + '…' + address.slice(-4);
}
