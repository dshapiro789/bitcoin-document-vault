import { FiWifi } from 'react-icons/fi';

interface NodeStatusProps {
  currentNodeUrl: string;
}

export default function NodeStatus({ currentNodeUrl }: NodeStatusProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
      <FiWifi className="text-3xl mb-2 text-primary-orange mx-auto" />
      <h3 className="text-lg font-semibold mb-1">Node Status</h3>
      <p className="text-sm text-green-600 font-semibold">Connected</p>
      <p className="text-xs text-gray-600 mt-1">Current Node:</p>
      <p className="text-xs text-gray-600">{currentNodeUrl}</p>
    </div>
  );
}