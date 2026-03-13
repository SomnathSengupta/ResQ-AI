interface WorkflowCardProps {
  title: string;
  desc: string;
  image: string;
}

const WorkflowCard = ({ title, desc, image }: WorkflowCardProps) => {
  return (
    <div
      className="h-[300px] w-[270px] bg-slate-100 rounded-2xl 
                 transform transition duration-300 ease-in-out 
                 hover:scale-105 hover:shadow-2xl cursor-pointer"
    >
      <div className="h-[150px] overflow-hidden rounded-t-2xl">
        <img
          className="h-full w-full object-cover"
          src={image}
          alt={title}
        />
      </div>

      <div className="p-[10px]">
        <p className="text-center text-gray-800 font-bold text-lg">{title}</p>
        <p className="text-center text-gray-600">{desc}</p>
      </div>
    </div>
  );
};

export default WorkflowCard;