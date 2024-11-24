import { useQuery } from '@tanstack/react-query';
import { getDegenOrEnsName } from '@/utils/web3';
import Link from 'next/link';
import { Chain } from '@/utils/types';
import CopyAddressIcon from '@/components/global/CopyAddressIcon';

export default function DisplayAddress({
  chain,
  address,
  showCopyIcon,
}: {
  chain: Chain;
  address: string;
  showCopyIcon?: boolean;
}) {
  const walletDisplayName = useQuery({
    queryKey: ['getWalletDisplayName', address, chain.slug],
    queryFn: () =>
      getWalletDisplayName({
        address: address,
        chainName: chain.slug,
      }),
  });
  if (showCopyIcon) {
    return (
      <div className='flex items-center lg:w-[29ch] w-[15ch]'>
        <Link
          href={`/${chain.slug}/account/${address}`}
          className='hover:text-gray-200 max-w-[29ch] truncate mr-2'
        >
          {walletDisplayName.data ?? address}
        </Link>
        <CopyAddressIcon address={address} size={20} />
      </div>
    );
  }

  return (
    <Link
      href={`/${chain.slug}/account/${address}`}
      className='overflow-hidden lg:w-[25ch] w-[15ch] overflow-ellipsis hover:text-gray-200'
    >
      {walletDisplayName.data ?? address}
    </Link>
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
