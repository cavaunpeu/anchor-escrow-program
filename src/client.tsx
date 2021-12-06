import React from 'react';
import * as anchor from '@project-serum/anchor';

class Client extends React.Component {
    initialize() {
        anchor.web3.Keypair.generate()
    }
}

export default Client;
