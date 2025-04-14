package room_temporal

import (
	"fmt"
	"strings"
)

var AllowedActions = map[string]struct{}{
	"fold":  {},
	"check": {},
	"call":  {},
	"raise": {},
	"bet":   {},
	"allin": {},
}

func isAllowedAction(action string) bool {
	_, ok := AllowedActions[action]
	return ok
}

func ValidatePlayerAction(move string, state *RoomState, userID string) error {
	if userID != state.CurrentPlayer {
		return fmt.Errorf("not your turn")
	}

	parts := strings.Fields(move)
	if len(parts) == 0 {
		return fmt.Errorf("empty move")
	}

	action := parts[0]
	args := parts[1:]

	var ActionRegistry = map[string]PlayerAction{
		"fold":  FoldAction{},
		"check": CheckAction{},
		"call":  CallAction{},
		"raise": RaiseAction{},
		"bet":   BetAction{},
		"allin": AllinAction{},
	}

	handler, ok := ActionRegistry[action]
	if !ok {
		return fmt.Errorf("unknown action: %s", action)
	}

	return handler.Validate(state, userID, args)
}

func GetAvailableActions(state *RoomState, userID string) []string {
	var actions []string
	chips := state.PlayerChips[userID]
	currentBet := state.CurrentBet

	actions = append(actions, "fold")

	if currentBet == 0 {
		actions = append(actions, "check")
		if chips > 0 {
			actions = append(actions, "bet")
		}
	} else {
		if chips >= currentBet {
			actions = append(actions, "call")
		}
		if chips > currentBet {
			actions = append(actions, "raise")
		}
	}

	if chips > 0 {
		actions = append(actions, "allin")
	}

	return actions
}
