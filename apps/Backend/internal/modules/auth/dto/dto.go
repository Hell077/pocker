package dto

// RegisterRequest represents registration input
type RegisterRequest struct {
	Email    string `json:"email" example:"user@example.com"`
	Password string `json:"password" example:"strongpassword"`
	Username string `json:"username" example:"username"`
}

// LoginRequest represents login input
type LoginRequest struct {
	Email    string `json:"email" example:"user@example.com"`
	Password string `json:"password" example:"strongpassword"`
}

// LoginResponse represents JWT tokens returned after login
type LoginResponse struct {
	AccessToken  string `json:"access_token" example:"access.jwt.token"`
	RefreshToken string `json:"refresh_token" example:"refresh.jwt.token"`
}

type Me struct {
	Id       string `json:"id,omitempty"`
	Username string `json:"username,omitempty"`
	Email    string `json:"email,omitempty"`
	Balance  int64  `json:"balance"`
}

type MeById struct {
	UserID string `json:"user_id,omitempty"`
}
