package room_temporal

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
