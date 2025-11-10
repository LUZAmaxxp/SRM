import { Plus, AlertTriangle, Table } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarMenuProps {
  activeSection?: 'overview' | 'interventions' | 'reclamations' | 'records';
  onSectionChange?: (section: 'overview' | 'interventions' | 'reclamations' | 'records') => void;
}

export default function SidebarMenu({ activeSection, onSectionChange }: SidebarMenuProps) {
  const router = useRouter();

  return (
    <div className="w-16 bg-white shadow-lg flex flex-col items-center py-8 space-y-6">
      <div
        className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => router.push('/interventions/new')}
      >
        <Plus className="w-6 h-6 text-white" />
      </div>
      <div
        className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
        onClick={() => router.push('/reclamations/new')}
      >
        <AlertTriangle className="w-6 h-6 text-white" />
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
          activeSection === 'records' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
        onClick={() => {
          if (onSectionChange) {
            onSectionChange('records');
          } else {
            router.push('/dashboard?section=records');
          }
        }}
      >
        <Table className="w-6 h-6" />
      </div>
    </div>
  );
}
