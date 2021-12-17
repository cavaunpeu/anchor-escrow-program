import { FC } from "react";
import Header from "./Header";
import Description from "./Description";
import UserInterface from "./UserInterface";

export const Navigation: FC = () => {
  return (
    <div className="bg-gray-800 p-8">
      <Header />
      <div className="flex flex-row h-full py-20">
        <div className="flex flex-col justify-start w-3/5 px-24">
          <UserInterface />
        </div>
        <div className="flex flex-col justify-start w-2/5 pr-24">
          <Description />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
