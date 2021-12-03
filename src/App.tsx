import React from 'react';
import {Description, Header, EscrowProgram} from './components'

const App = () => {
    return (
        <div className="bg-gray-800 p-8">
            <Header />
            <div className='flex justify-between'>
                <Description />
                <div className='flex flex-col w-3/5 h-screen justify-center'>
                    <EscrowProgram />
                </div>
            </div>
        </div>
    )
}

export default App;
