
import React, { useState } from 'react';
import Layout from './components/Layout';
import DraftingRoom from './components/DraftingRoom';
import CopilotChat from './components/CopilotChat';
import AssetDashboard from './components/AssetDashboard';
import { AppView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AssetDashboard />;
      case 'drafting':
        return <DraftingRoom />;
      case 'copilot':
        return <CopilotChat />;
      default:
        return <AssetDashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
