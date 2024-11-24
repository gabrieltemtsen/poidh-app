import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { CopyDoneIcon, CopyIcon } from '@/components/global/Icons';

interface CopyAddressIconProps {
  address: string;
  size?: number;
}

const CopyAddressIcon: React.FC<CopyAddressIconProps> = ({
  address,
  size = 20,
}) => {
  const [isCopied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <span onClick={handleCopy} className='cursor-pointer hover:text-gray-200'>
      {isCopied ? (
        <CopyDoneIcon width={size} height={size} />
      ) : (
        <CopyIcon width={size} height={size} />
      )}
    </span>
  );
};

export default CopyAddressIcon;
