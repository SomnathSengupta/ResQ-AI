import WorkflowCard from "./WorkflowCard";
import dataCollection from "../../assets/dataCollection.jpg";
import aiRobot from "../../assets/aiRobot.png";
import dataVisualization from "../../assets/dataVisualization.jpg";
import ringBell from "../../assets/ringBell.png";

const LowerComponent: React.FC = () => {
  return (
    <div className="bg-slate-200 p-[40px]">
      <p className="text-2xl text-gray-800 font-semibold text-center">
        How It Works
      </p>

      <div className="flex justify-center gap-7 p-4">
        <WorkflowCard
          title="Collect Data"
          desc="Gather disaster-related posts from social media and news sources"
          image={dataCollection}
        />

        <WorkflowCard
          title="AI Analysis"
          desc="AI Classifies posts into categories like rescue, medical, shelter and filters out misinformation."
          image={aiRobot}
        />

        <WorkflowCard
          title="Visualize Alerts"
          desc="Display alerts with priority indicators"
          image={dataVisualization}
        />

        <WorkflowCard
          title="Take Action"
          desc="Respond to priority alerts based on AI-generated insights"
          image={ringBell}
        />
      </div>
    </div>
  );
};

export default LowerComponent;