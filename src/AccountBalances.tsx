import { FC } from "react";

interface AccountBalancesProps {
  willFooCoinBalance: number;
  willBarCoinBalance: number;
  alanFooCoinBalance: number;
  alanBarCoinBalance: number;
  escrowBalance: number;
}

const AccountBalances: FC<AccountBalancesProps> = (
  props: AccountBalancesProps
) => {
  return (
    <section className="antialiased text-light-gray">
      <div className="flex flex-col">
        <div className="w-full mx-auto bg-dark-grey shadow-2xl rounded-2xl border border-gray-600">
          <header className="px-5 py-4 border-b border-light-gray">
            <h2 className="font-semibold">Account Balances</h2>
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
                      <div className="font-semibold text-left">Balance</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-md divide-y divide-light-gray text-light-gray text-left font-medium">
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                          <img
                            className="rounded-full"
                            src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg"
                            width="40"
                            height="40"
                            alt="Will"
                          ></img>
                        </div>
                        <div>Will</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>FooCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">
                        {props.willFooCoinBalance}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                          <img
                            className="rounded-full"
                            src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg"
                            width="40"
                            height="40"
                            alt="Will"
                          ></img>
                        </div>
                        <div>Will</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>BarCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">
                        {props.willBarCoinBalance}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                          <img
                            className="rounded-full"
                            src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg"
                            width="40"
                            height="40"
                            alt="Alan"
                          ></img>
                        </div>
                        <div>Alan</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>FooCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">
                        {props.alanFooCoinBalance}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                          <img
                            className="rounded-full"
                            src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg"
                            width="40"
                            height="40"
                            alt="Alan"
                          ></img>
                        </div>
                        <div>Alan</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>BarCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">
                        {props.alanBarCoinBalance}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                          <img
                            className="rounded-full"
                            src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-09.jpg"
                            width="40"
                            height="40"
                            alt="Escrow"
                          ></img>
                        </div>
                        <div>Escrow</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>FooCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">
                        {props.escrowBalance}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountBalances;
