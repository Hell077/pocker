import React, { useEffect, useState } from 'react';
import './AuthModal.css';
import axios from 'axios';

const ApiUrl = import.meta.env.VITE_BACKEND_API;
const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await axios.post(ApiUrl+"/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { access_token, refresh_token } = res.data;

        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);

        alert("✅ Успешный вход");
        onClose();
      } else {
        const res = await axios.post(ApiUrl+"/api/auth/register", {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
        });

        if (res.status === 200) {
          alert("✅ Успешная регистрация");
          setIsLogin(true);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(`❌ Ошибка: ${err.response?.data || err.message}`);
      } else {
        alert("⚠ Неизвестная ошибка");
      }
    }
  };


  // 👇 Добавляем обработку ESC и скролл body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
      <div className="auth-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button className="auth-close" onClick={onClose}>×</button>
          <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <form onSubmit={handleSubmit}>
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
            <input
                name="password"
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <button type="submit" className="auth-submit">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="auth-switch">
            {isLogin ? (
                <>Нет аккаунта? <span onClick={() => setIsLogin(false)}>Регистрация</span></>
            ) : (
                <>Есть аккаунт? <span onClick={() => setIsLogin(true)}>Войти</span></>
            )}
          </p>
        </div>
      </div>
  );
};

export default AuthModal;
