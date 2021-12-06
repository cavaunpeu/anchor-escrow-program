import React from 'react';
import {Description, Header, EscrowProgram} from './components'
import Client from './client';

const App = () => {
    <Client />
    return (
        <div className="bg-gray-800 p-8">
            <Header />
            <div className='flex flex-row h-screen py-20'>
                <div className='flex flex-col justify-start w-3/5 px-24'>
                    <EscrowProgram />
                </div>
                <div className='flex flex-col justify-start w-2/5 pr-24'>
                    <Description />
                </div>
            </div>
        </div>
    )
}

export default App;
