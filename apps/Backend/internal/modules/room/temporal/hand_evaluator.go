package room_temporal

import (
	"sort"
	"strings"
)

var rankMap = map[string]int{
	"2": 2, "3": 3, "4": 4, "5": 5,
	"6": 6, "7": 7, "8": 8, "9": 9,
	"10": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
}

type HandScore struct {
	Rank  int      // сила комбинации (чем выше, тем сильнее)
	Cards []string // используемые карты
	Desc  string   // описание, например: "Full House"
}

func EvaluateHand(cards []string) HandScore {
	best := HandScore{Rank: 0, Desc: "High Card"}
	all := combinations(cards, 5)

	for _, hand := range all {
		score := scoreCombo(hand)
		if score.Rank > best.Rank {
			best = score
		}
	}
	return best
}

func scoreCombo(cards []string) HandScore {
	ranks := make([]int, 0)
	suits := make(map[string]int)
	counts := make(map[int]int)
	rankCount := make(map[string]int)

	for _, c := range cards {
		value := extractRank(c)
		suit := extractSuit(c)
		r := rankMap[value]
		ranks = append(ranks, r)
		suits[suit]++
		counts[r]++
		rankCount[value]++
	}

	sort.Ints(ranks)

	isFlush := false
	for _, v := range suits {
		if v == 5 {
			isFlush = true
			break
		}
	}

	isStraight := checkStraight(ranks)

	switch {
	case isFlush && isStraight:
		return HandScore{Rank: 9, Cards: cards, Desc: "Straight Flush"}
	case hasOfAKind(counts, 4):
		return HandScore{Rank: 8, Cards: cards, Desc: "Four of a Kind"}
	case hasFullHouse(counts):
		return HandScore{Rank: 7, Cards: cards, Desc: "Full House"}
	case isFlush:
		return HandScore{Rank: 6, Cards: cards, Desc: "Flush"}
	case isStraight:
		return HandScore{Rank: 5, Cards: cards, Desc: "Straight"}
	case hasOfAKind(counts, 3):
		return HandScore{Rank: 4, Cards: cards, Desc: "Three of a Kind"}
	case hasTwoPair(counts):
		return HandScore{Rank: 3, Cards: cards, Desc: "Two Pair"}
	case hasOfAKind(counts, 2):
		return HandScore{Rank: 2, Cards: cards, Desc: "One Pair"}
	default:
		return HandScore{Rank: 1, Cards: cards, Desc: "High Card"}
	}
}

func extractRank(card string) string {
	return strings.TrimRight(card, "♠♥♦♣")
}

func extractSuit(card string) string {
	return string(card[len(card)-1])
}

func checkStraight(ranks []int) bool {
	m := make(map[int]bool)
	for _, r := range ranks {
		m[r] = true
	}

	// Ace-low straight
	if m[14] && m[2] && m[3] && m[4] && m[5] {
		return true
	}

	// Normal straights
	for i := 2; i <= 10; i++ {
		ok := true
		for j := 0; j < 5; j++ {
			if !m[i+j] {
				ok = false
				break
			}
		}
		if ok {
			return true
		}
	}
	return false
}

func hasOfAKind(counts map[int]int, n int) bool {
	for _, v := range counts {
		if v == n {
			return true
		}
	}
	return false
}

func hasFullHouse(counts map[int]int) bool {
	hasThree := false
	hasTwo := false
	for _, v := range counts {
		if v == 3 {
			hasThree = true
		} else if v == 2 {
			hasTwo = true
		}
	}
	return hasThree && hasTwo
}

func hasTwoPair(counts map[int]int) bool {
	pairs := 0
	for _, v := range counts {
		if v == 2 {
			pairs++
		}
	}
	return pairs >= 2
}

// combinations возвращает все возможные комбинации из n карт по k (например, 5 из 7)
func combinations(arr []string, k int) [][]string {
	var result [][]string
	var comb []string

	var backtrack func(start int)
	backtrack = func(start int) {
		if len(comb) == k {
			tmp := make([]string, k)
			copy(tmp, comb)
			result = append(result, tmp)
			return
		}
		for i := start; i < len(arr); i++ {
			comb = append(comb, arr[i])
			backtrack(i + 1)
			comb = comb[:len(comb)-1]
		}
	}

	backtrack(0)
	return result
}
