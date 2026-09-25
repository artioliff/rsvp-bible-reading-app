import { useEffect } from 'react';
import useAppState from './hooks/useAppState';
import HomeScreen from './components/screens/HomeScreen';
import SelectionScreen from './components/screens/SelectionScreen';
import ReaderScreen from './components/screens/ReaderScreen';

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
    books,
    translation,
    setTranslation,
    isLoading,
    isFallback,
  } = useAppState();

  // Tema em todas as telas — define apenas o ATRIBUTO em <html data-theme="…">;
  // todos os valores de cor vivem em src/index.css (docs/paleta-de-cores.md)
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
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
          onToggleTheme={handleToggleTheme}
          historyCount={history.length}
          favoritesCount={favorites.length}
          translation={translation}
        />
      )}

      {screen === 'select' && (
        <SelectionScreen
          onNavigate={navigate}
          selection={selection}
          onSelectionChange={setSelection}
          books={books}
          translation={translation}
          onTranslationChange={setTranslation}
          isLoading={isLoading}
          isFallback={isFallback}
        />
      )}

      {screen === 'reader' && (
        <ReaderScreen
          // Remonta ao trocar capítulo/livro: reseta o índice do RSVP,
          // a tela "Leitura Concluída" e a sessão de histórico
          key={`${selection.book}_${selection.chapter}`}
          onNavigate={navigate}
          selection={selection}
          onSelectionChange={setSelection}
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
          books={books}
        />
      )}
    </div>
  );
}

export default App;
