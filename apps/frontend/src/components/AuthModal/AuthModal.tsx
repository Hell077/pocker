import React, { useEffect, useState } from 'react';
import './AuthModal.css';
import axios from 'axios';
import { useToastRequest } from '@hooks/useToastRequest';
import { Eye, EyeOff } from 'lucide-react'; // 👁️ импорт иконок

const ApiUrl = import.meta.env.VITE_BACKEND_API;

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', nickname: '', code: '' });
    const [isClosing, setIsClosing] = useState(false);
    const [errorShake, setErrorShake] = useState(false);
    const [fadeTransition, setFadeTransition] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { handleRequest } = useToastRequest();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password || formData.code.length !== 6) {
            setErrorShake(true);
            setTimeout(() => setErrorShake(false), 500);
            return;
        }

        if (isLogin) {
            const res = await handleRequest(
                () =>
                    axios.post(`${ApiUrl}/api/auth/login`, {
                        email: formData.email,
                        password: formData.password,
                        code: formData.code,
                    }),
                {
                    successMessage: '✅ Успешный вход',
                }
            );

            if (res) {
                const { access_token, refresh_token } = res.data;
                localStorage.setItem('accessToken', access_token);
                localStorage.setItem('refreshToken', refresh_token);
                closeWithAnimation();
            }
        } else {
            const res = await handleRequest(
                () =>
                    axios.post(`${ApiUrl}/api/auth/register`, {
                        email: formData.email,
                        password: formData.password,
                        nickname: formData.nickname,
                        code: formData.code,
                    }),
                {
                    successMessage: '✅ Успешная регистрация',
                }
            );

            if (res) {
                setIsLogin(true);
            }
        }
    };

    const closeWithAnimation = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200);
    };

    const switchForm = () => {
        setFadeTransition(true);
        setTimeout(() => {
            setIsLogin(!isLogin);
            setFadeTransition(false);
        }, 200);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeWithAnimation();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const el = document.querySelector<HTMLInputElement>('input[name="email"]');
                el?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`auth-overlay ${isClosing ? 'fade-out' : ''}`} onClick={closeWithAnimation}>
            <div className={`auth-modal ${isClosing ? 'fade-out' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="auth-close" onClick={closeWithAnimation}>×</button>
                <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
                <form
                    onSubmit={handleSubmit}
                    className={`auth-modal-content ${fadeTransition ? 'fade' : ''} ${errorShake ? 'shake' : ''}`}
                >
                    {!isLogin && (
                        <input
                            name="nickname"
                            placeholder="Никнейм"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <div className="password-wrapper">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="password-toggle"
                            onClick={() => setShowPassword(prev => !prev)}
                            title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                    <input
                        name="code"
                        type="text"
                        placeholder="6-значный код"
                        value={formData.code}
                        onChange={handleChange}
                        pattern="\d{6}"
                        maxLength={6}
                        required
                    />
                    <button type="submit" className="auth-submit">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="auth-switch">
                    {isLogin ? (
                        <>Нет аккаунта? <span onClick={switchForm}>Регистрация</span></>
                    ) : (
                        <>Есть аккаунт? <span onClick={switchForm}>Войти</span></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
