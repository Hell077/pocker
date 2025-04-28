import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './root.css';
import App from './App.tsx';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom'; // ← вот он
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter> {/* ← оборачиваем */}
            <AuthProvider>
                <App />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    style={{ zIndex: 99999 }}
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
