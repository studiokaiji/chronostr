import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <div className="w-full p-4 bg-slate-50 bg-opacity-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/">
          <div className="font-bold select-none">chronostr</div>
        </Link>
        <div>
          <Button size="sm" variant="outline">
            + Create New Event
          </Button>
        </div>
      </div>
    </div>
  );
};
