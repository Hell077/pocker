package room_temporal

import (
	"fmt"
	"strconv"
)

// Интерфейс действия игрока
type PlayerAction interface {
	Validate(state *RoomState, userID string, args []string) error
}

// ======================= FOLD =======================
type FoldAction struct{}

func (a FoldAction) Validate(state *RoomState, userID string, args []string) error {
	return nil
}

// ======================= CHECK =======================
type CheckAction struct{}

func (a CheckAction) Validate(state *RoomState, userID string, args []string) error {
	if state.CurrentBet > 0 {
		return fmt.Errorf("cannot check, current bet is %d", state.CurrentBet)
	}
	return nil
}

// ======================= CALL =======================
type CallAction struct{}

func (a CallAction) Validate(state *RoomState, userID string, args []string) error {
	chips := state.PlayerChips[userID]
	if state.CurrentBet == 0 {
		return fmt.Errorf("cannot call, no active bet")
	}
	if chips < state.CurrentBet {
		return fmt.Errorf("not enough chips to call: have %d, need %d", chips, state.CurrentBet)
	}
	return nil
}

// ======================= BET =======================
type BetAction struct{}

func (a BetAction) Validate(state *RoomState, userID string, args []string) error {
	if state.CurrentBet > 0 {
		return fmt.Errorf("cannot bet, current bet already placed")
	}
	if len(args) != 1 {
		return fmt.Errorf("bet requires amount")
	}
	amount, err := strconv.Atoi(args[0])
	if err != nil || amount <= 0 {
		return fmt.Errorf("invalid bet amount")
	}
	if int64(amount) > state.PlayerChips[userID] {
		return fmt.Errorf("not enough chips to bet")
	}
	return nil
}

// ======================= RAISE =======================
type RaiseAction struct{}

func (a RaiseAction) Validate(state *RoomState, userID string, args []string) error {
	if state.CurrentBet == 0 {
		return fmt.Errorf("cannot raise, no bet yet")
	}
	if len(args) != 1 {
		return fmt.Errorf("raise requires amount")
	}
	amount, err := strconv.Atoi(args[0])
	if err != nil || amount <= 0 {
		return fmt.Errorf("invalid raise amount")
	}
	if int64(amount) < state.LastRaise {
		return fmt.Errorf("raise must be at least %d", state.LastRaise)
	}
	if int64(amount) > state.PlayerChips[userID] {
		return fmt.Errorf("not enough chips to raise")
	}
	return nil
}

// ======================= ALLIN =======================
type AllinAction struct{}

func (a AllinAction) Validate(state *RoomState, userID string, args []string) error {
	if state.PlayerChips[userID] <= 0 {
		return fmt.Errorf("you have no chips to allin")
	}
	return nil
}
