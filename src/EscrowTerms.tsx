import { FC } from 'react';

interface EscrowTermsProps {
  escrowInitialized: boolean,
  submitButtonClicked: boolean,
  willFooCoinBalance: number,
  alanBarCoinBalance: number,
  fooCoinAmount: number,
  barCoinAmount: number,
  updateCoinAmount: (event: any, coin: string) => void,
}

const EscrowTerms: FC<EscrowTermsProps> = (props: EscrowTermsProps) => {
  return (
    <section className="antialiased pt-8 text-light-gray">
      <div className="flex flex-col">
        <div className="w-full mx-auto bg-dark-grey shadow-2xl rounded-2xl border border-gray-600">
          <header className="px-5 py-4 border-b border-light-gray">
            <h2 className="font-semibold">Escrow Terms</h2>
          </header>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="table-fixed w-full justify-center align-middle self-center">
                <thead className="text-xs font-extrabold uppercase">
                  <tr>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Account</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Coin</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Amount</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-md divide-y divide-light-gray font-medium">
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg" width="40" height="40" alt="Will"></img></div>
                        <div>Will</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">FooCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <input
                        disabled={!props.escrowInitialized || props.submitButtonClicked}
                        placeholder={props.escrowInitialized ? 'max: ' + props.willFooCoinBalance : ''}
                        value={props.fooCoinAmount || ''}
                        onChange={(event) => props.updateCoinAmount(event, 'foo')}
                        className='input-field bg-dark-grey'
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg" width="40" height="40" alt="Alan"></img></div>
                        <div className="font-medium">Alan</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">BarCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <input
                        disabled={!props.escrowInitialized || props.submitButtonClicked}
                        placeholder={props.escrowInitialized ? 'max: ' + props.alanBarCoinBalance : ''}
                        value={props.barCoinAmount || ''}
                        onChange={(event) => props.updateCoinAmount(event, 'bar')}
                        className='input-field bg-dark-grey'
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EscrowTerms;