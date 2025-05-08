package room_temporal

import (
	"fmt"
	"strconv"
)

// Интерфейс действия игрока
type PlayerAction interface {
	Validate(state *RoomState, userID string, args []string) error
	Execute(state *RoomState, userID string, args []string)
}

// ======================= FOLD =======================
type FoldAction struct{}

func (a FoldAction) Validate(state *RoomState, userID string, args []string) error {
	return nil
}
func (a FoldAction) Execute(state *RoomState, userID string, args []string) {
	state.PlayerFolded[userID] = true
}

// ======================= CHECK =======================
type CheckAction struct{}

func (a CheckAction) Validate(state *RoomState, userID string, args []string) error {
	if state.CurrentBet > 0 {
		return fmt.Errorf("cannot check, current bet is %d", state.CurrentBet)
	}
	return nil
}
func (a CheckAction) Execute(state *RoomState, userID string, args []string) {
	// Ничего не делаем
}

// ======================= CALL =======================
type CallAction struct{}

func (a CallAction) Validate(state *RoomState, userID string, args []string) error {
	toCall := state.CurrentBet - state.PlayerBets[userID]
	if toCall <= 0 {
		return fmt.Errorf("nothing to call")
	}
	if state.PlayerChips[userID] < toCall {
		return fmt.Errorf("not enough chips to call: have %d, need %d", state.PlayerChips[userID], toCall)
	}
	return nil
}
func (a CallAction) Execute(state *RoomState, userID string, args []string) {
	toCall := state.CurrentBet - state.PlayerBets[userID]
	state.PlayerChips[userID] -= toCall
	state.PlayerBets[userID] += toCall
	state.Pot += toCall
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
func (a BetAction) Execute(state *RoomState, userID string, args []string) {
	amount, _ := strconv.Atoi(args[0])
	amt := int64(amount)
	state.PlayerChips[userID] -= amt
	state.PlayerBets[userID] += amt
	state.Pot += amt
	state.CurrentBet = amt
	state.LastRaise = amt
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
	toCall := state.CurrentBet - state.PlayerBets[userID]
	total := toCall + int64(amount)
	if state.PlayerChips[userID] < total {
		return fmt.Errorf("not enough chips to raise: need %d, have %d", total, state.PlayerChips[userID])
	}
	return nil
}
func (a RaiseAction) Execute(state *RoomState, userID string, args []string) {
	amount, _ := strconv.Atoi(args[0])
	toCall := state.CurrentBet - state.PlayerBets[userID]
	total := toCall + int64(amount)
	state.PlayerChips[userID] -= total
	state.PlayerBets[userID] += total
	state.Pot += total
	state.LastRaise = int64(amount)
	state.CurrentBet += int64(amount)
}

// ======================= ALLIN =======================
type AllinAction struct{}

func (a AllinAction) Validate(state *RoomState, userID string, args []string) error {
	if len(args) > 1 {
		return fmt.Errorf("allin takes zero or one argument")
	}
	amount := state.PlayerChips[userID]

	if len(args) == 1 {
		a, err := strconv.Atoi(args[0])
		if err != nil || a <= 0 {
			return fmt.Errorf("invalid allin amount")
		}
		if int64(a) > amount {
			return fmt.Errorf("you can't allin more than you have")
		}
	}
	if amount <= 0 {
		return fmt.Errorf("you have no chips to allin")
	}
	return nil
}
func (a AllinAction) Execute(state *RoomState, userID string, args []string) {
	amount := state.PlayerChips[userID]
	if len(args) == 1 {
		val, _ := strconv.Atoi(args[0])
		amount = int64(val)
	}
	state.PlayerChips[userID] -= amount
	state.PlayerAllIn[userID] = true
	state.PlayerBets[userID] += amount
	state.Pot += amount
	if state.PlayerBets[userID] > state.CurrentBet {
		state.LastRaise = state.PlayerBets[userID] - state.CurrentBet
		state.CurrentBet = state.PlayerBets[userID]
	}
}

// ======================= REGISTRY + VALIDATOR =======================

var ActionRegistry = map[string]PlayerAction{
	"fold":  FoldAction{},
	"check": CheckAction{},
	"call":  CallAction{},
	"raise": RaiseAction{},
	"bet":   BetAction{},
	"allin": AllinAction{},
}

func ValidatePlayerAction(action string, state *RoomState, userID string, args []string) error {
	if userID != state.CurrentPlayer {
		return fmt.Errorf("not your turn")
	}
	handler, ok := ActionRegistry[action]
	if !ok {
		return fmt.Errorf("unknown action: %s", action)
	}
	return handler.Validate(state, userID, args)
}
