import { Link } from "react-router-dom";

const UpperComponent: React.FC = () => {
  return (
    <div className="p-[70px] flex flex-col justify-center items-center gap-6">
      <div>
        <p className="text-center text-4xl font-bold text-gray-800 mb-3">
          ResQAI - From chaos to clarity using AI
        </p>
        <p className="text-lg text-center font-medium text-gray-700 max-w-4xl">
          Real-time AI-powered disaster response tool that collects, analyzes,
          and summarizes disaster data to help authorities take faster,
          smarter rescue actions.
        </p>
      </div>

      <div>
        <button className="text-xl text-white bg-indigo-700 font-medium w-[200px] p-2 rounded-xl hover:bg-indigo-800">
          <Link to='/login'>Get Started</Link>
        </button>
      </div>
    </div>
  );
};

export default UpperComponent;