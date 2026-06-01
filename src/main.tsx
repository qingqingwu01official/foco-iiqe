import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './app/App';

// StrictMode intentionally disabled: WelcomePage chat useEffect runs greeting
// animation which would fire twice in dev mode causing duplicate messages.
createRoot(document.getElementById('root')!).render(<App />);
