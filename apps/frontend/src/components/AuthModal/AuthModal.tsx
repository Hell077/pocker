import React, { useEffect, useRef, useState } from 'react';
import './AuthModal.css';
import axios from 'axios';
import { useToastRequest } from '@hooks/useToastRequest';
import { Eye, EyeOff } from 'lucide-react';
import CodeInput from './CodeInput';
import { useAuth } from '../../context/AuthContext';

const ApiUrl = import.meta.env.VITE_BACKEND_API;

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState<'login' | 'register' | 'confirm-login' | 'confirm-register'>('login');
    const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });
    const [isClosing, setIsClosing] = useState(false);
    const [errorShake, setErrorShake] = useState(false);
    const [fadeTransition] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { handleRequest } = useToastRequest();
    const modalRef = useRef<HTMLDivElement>(null);

    const { fetchMe } = useAuth(); // 🆕 подключаем auth context

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent | Event) => {
        if (e.preventDefault) e.preventDefault();

        if (!formData.email || !formData.password || (step === 'register' && !formData.nickname)) {
            setErrorShake(true);
            setTimeout(() => setErrorShake(false), 500);
            return;
        }

        if (step === 'login') {
            const res = await handleRequest(
              () => axios.post(`${ApiUrl}/api/auth/login`, {
                  email: formData.email,
                  password: formData.password,
              }),
              { successMessage: '📨 Код отправлен на почту' }
            );
            if (res) setStep('confirm-login');
        }

        if (step === 'register') {
            const res = await handleRequest(
              () => axios.post(`${ApiUrl}/api/auth/register`, {
                  email: formData.email,
                  password: formData.password,
                  nickname: formData.nickname,
              }),
              { successMessage: '📨 Код отправлен на почту' }
            );
            if (res) setStep('confirm-register');
        }
    };

    const handleCodeSubmit = async (code: string) => {
        const url = step === 'confirm-login'
          ? `${ApiUrl}/api/auth/login/confirm`
          : `${ApiUrl}/api/auth/register/confirm`;

        const res = await handleRequest(
          () => axios.post(url, { email: formData.email, code }),
          { successMessage: '✅ Успешно' }
        );

        if (res && step === 'confirm-login') {
            const { access_token, refresh_token } = res.data;
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);

            await fetchMe(); // 🆕 подтягиваем user
            closeWithAnimation();
        }

        if (res && step === 'confirm-register') {
            setStep('login');
        }
    };

    const closeWithAnimation = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
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
          <div
            className={`auth-modal ${isClosing ? 'fade-out' : ''}`}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
              <button className="auth-close" onClick={closeWithAnimation}>×</button>

              {step === 'login' && (
                <>
                    <h2>Вход</h2>
                    <form
                      onSubmit={handleSubmit}
                      className={`auth-modal-content ${fadeTransition ? 'fade' : ''} ${errorShake ? 'shake' : ''}`}
                    >
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
                            <span className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </span>
                        </div>
                        <button type="submit" className="auth-submit">Войти</button>
                    </form>
                    <p className="auth-switch">
                        Нет аккаунта? <span onClick={() => setStep('register')}>Регистрация</span>
                    </p>
                </>
              )}

              {step === 'register' && (
                <>
                    <h2>Регистрация</h2>
                    <form
                      onSubmit={handleSubmit}
                      className={`auth-modal-content ${fadeTransition ? 'fade' : ''} ${errorShake ? 'shake' : ''}`}
                    >
                        <input
                          name="nickname"
                          placeholder="Никнейм"
                          value={formData.nickname}
                          onChange={handleChange}
                          required
                        />
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
                            <span className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </span>
                        </div>
                        <button type="submit" className="auth-submit">Зарегистрироваться</button>
                    </form>
                    <p className="auth-switch">
                        Есть аккаунт? <span onClick={() => setStep('login')}>Войти</span>
                    </p>
                </>
              )}

              {(step === 'confirm-login' || step === 'confirm-register') && (
                <>
                    <h2>Двухфакторная проверка</h2>
                    <p className="auth-message">Введите код, отправленный на вашу почту</p>
                    <CodeInput onComplete={handleCodeSubmit} />
                    <p className="auth-resend">
                        Не пришёл код? <span onClick={handleSubmit}>Отправить повторно</span>
                    </p>
                </>
              )}
          </div>
      </div>
    );
};

export default AuthModal;
