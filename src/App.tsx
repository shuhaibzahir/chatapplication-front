import { useEffect } from 'react';
import { useStore } from './store'; 
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';

function App() {
  const currentUser = useStore(state => state.currentUser);
  const isDarkMode = useStore(state => state.isDarkMode);
  
  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {!currentUser ? <LoginScreen /> : <ChatInterface />}
    </div>
  );
}

export default App;