import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { AdminAgents } from '@/components/AdminAgents';

const Agents: React.FC = () => {
  return (
    <AdminLayout>
      <AdminAgents />
    </AdminLayout>
  );
};

export default Agents;