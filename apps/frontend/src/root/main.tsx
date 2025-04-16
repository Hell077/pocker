import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './root.css';
import App from './App.tsx';
import { AuthProvider } from '../context/AuthContext'; // 👈 добавь этот импорт

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider> {/* 👈 оборачиваем App */}
            <App />
        </AuthProvider>
    </StrictMode>
);
