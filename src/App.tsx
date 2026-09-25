import { useEffect } from 'react';
import useAppState from './hooks/useAppState';
import HomeScreen from './components/HomeScreen';
import SelectionScreen from './components/SelectionScreen';
import ReaderScreen from './components/ReaderScreen';

function App() {
  const {
    screen,
    navigate,
    settings,
    updateSettings,
    lastPosition,
    savePosition,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    history,
    addHistory,
    clearHistory,
    selection,
    setSelection,
  } = useAppState();

  // Update body background based on theme
  useEffect(() => {
    document.body.style.backgroundColor =
      settings.theme === 'dark' ? '#0f172a' : '#fffbeb';
  }, [settings.theme]);

  const handleToggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {screen === 'home' && (
        <HomeScreen
          onNavigate={navigate}
          lastPosition={lastPosition}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          historyCount={history.length}
          favoritesCount={favorites.length}
        />
      )}

      {screen === 'select' && (
        <SelectionScreen
          onNavigate={navigate}
          selection={selection}
          onSelectionChange={setSelection}
          theme={settings.theme}
        />
      )}

      {screen === 'reader' && (
        <ReaderScreen
          onNavigate={navigate}
          selection={selection}
          settings={settings}
          onSettingsChange={updateSettings}
          lastPosition={lastPosition}
          onSavePosition={savePosition}
          favorites={favorites}
          onAddFavorite={addFavorite}
          onRemoveFavorite={removeFavorite}
          isFavorite={isFavorite}
          history={history}
          onAddHistory={addHistory}
          onClearHistory={clearHistory}
        />
      )}
    </div>
  );
}

export default App;
