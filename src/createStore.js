import { useCallback, useEffect, useState } from "react"

// This implementation is inspired by react-create-shared-state.
// https://github.com/mucsi96/react-create-shared-state

// Creates a store that returns [state, setState]. A store manages subscriptions
// and broadcasts state changes to subscriptions.
export default function createStore(initialState) {
	const subscriptions = new Set()

	// Caches the current state for when a component mounts; see
	// useState(cachedState).
	let cachedState = initialState

	function useStore() {
		const [state, setState] = useState(cachedState)

		// Effect that manages subscriptions when a component mounts / unmounts.
		useEffect(() => {
			subscriptions.add(setState)
			return () => {
				subscriptions.delete(setState)
			}
		}, [])

		// Synthetic setState that broadcasts state changes to subscriptions.
		const syntheticSetState = useCallback(action => {
			const nextState = typeof action === "function" ? action(cachedState) : action
			cachedState = nextState
			setState(nextState)
			subscriptions.forEach(each => each(nextState))
		}, [])

		return [state, syntheticSetState]
	}

	return useStore
}
