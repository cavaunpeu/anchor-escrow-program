import { FC } from 'react';

const Description: FC = () => {
  return (
    <div className="text-indigo-100 text-xl font-mono leading-loose">
      <p className='pb-12'>
        In an escrow, <span className="text-indigo-300">Will</span> wants to exchange <span className="text-pink-300">FooCoins</span> for <span className="text-indigo-300">Alan's</span> <span className="text-pink-300">BarCoins</span>.

        To do so, <span className="text-indigo-300">Will</span> sends his <span className="text-pink-300">FooCoins</span> to a neutral "escrow" account.

        Once his coins have arrived, <span className="text-indigo-300">Alan</span> sends his <span className="text-pink-300">BarCoins</span> to <span className="text-indigo-300">Will</span>, and the escrow sends its <span className="text-pink-300">FooCoins</span> to <span className="text-indigo-300">Alan</span>.

        Both transactions are atomic: if anything goes wrong, they are rolled back.
      </p>
      <p className='pb-4'>Instructions:</p>
      <p className='pl-4'>1. <span className="text-indigo-300">Initialize</span> escrow.</p>
      <p className='pl-4'>2. Set <span className='text-pink-300'>FooCoins</span> and <span className='text-pink-300'>BarCoins</span> amounts.</p>
      <p className='pl-4'>3. <span className="text-indigo-300">Submit</span> escrow (as <span className="text-indigo-300">Will</span>).</p>
      <p className='pl-4'>4. <span className="text-indigo-300">Accept</span> escrow (as <span className="text-indigo-300">Alan</span>).</p>
    </div>
  )
}

export default Description;