package service

import (
	"errors"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"poker/internal/modules/auth/repo"
	"poker/packages/database"
	"time"
)

type AuthService interface {
	Register(email, password string) error
	Login(email, password string) (string, string, error) // access, refresh
	RefreshToken(refresh string) (string, error)
}

type authService struct {
	repo   repo.AuthRepo
	logger *zap.Logger
}

func NewAuthService(r repo.AuthRepo, logger *zap.Logger) AuthService {
	return &authService{repo: r, logger: logger}
}

func (s *authService) Register(email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	account := &database.Account{
		ID:       generateUUID(),
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.repo.CreateAccount(account); err != nil {
		return err
	}

	balance := &database.AccountBalance{
		ID:             generateUUID(),
		UserID:         account.ID,
		CurrentBalance: "0",
	}

	return s.repo.CreateBalance(balance)
}

func (s *authService) Login(email, password string) (string, string, error) {
	account, err := s.repo.GetAccountByEmail(email)
	if err != nil {
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accessToken, err := generateJWT(account.ID, 15*time.Minute)
	if err != nil {
		return "", "", err
	}
	refreshToken, err := generateJWT(account.ID, 7*24*time.Hour)
	return accessToken, refreshToken, err
}

func generateJWT(userID string, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(duration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("secret"))
}

func generateUUID() string {
	uuid, _ := uuid.NewUUID()
	return uuid.String()
}

func (s *authService) RefreshToken(refresh string) (string, error) {
	token, err := jwt.Parse(refresh, func(t *jwt.Token) (interface{}, error) {
		return []byte("secret"), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("invalid user id in token")
	}

	// создаём новый access token
	return generateJWT(userID, 30*time.Minute)
}
