# goal

Will wants to exchange 10 FooCoins for 22 BarCoins.

Will will put 10 FC into an escrow. When Bob puts 22 BC into this escrow, a swap is made.

# setup

- [x] create a FC mint.
- [x] give the testing program's wallet address authority over the FC mint.
- [ ] create a BC mint.
- [ ] give the testing program's wallet address authority over the BC mint.
- [ ] create a wallet for Will.
- [ ] create a wallet for Bob.
- [ ] create a FC account for Will.
- [ ] give Will wallet authority over this token account.
- [ ] mint FC to Will.
- [ ] create a BC account for Bob.
- [ ] give Bob wallet authority over this token account.
- [ ] mint BC to Bob.

# submit

- [ ] Will stipulates:
    - [ ] the amount of FC he wants to send.
    - [ ] the amount of BC he wants to receive.
- [ ] create an `fc_vault` for Will.
    - [ ] this is a new token account that will hold Will's FC.
    - [ ] assign ownership over `fc_vault` to the escrow program via a PDA.
    - [ ] use the escrow state's pubkey as a seed in this PDA.
- [ ] move Will's FCs from Will's FC token account into `fc_vault`.

# complete

- [ ] Bob gives consent to:
    - [ ] send BC from Bob's BC token account to Will's BC-ATA.
- [ ] send the FC in `fc_vault` to Bob's FC-ATA.

