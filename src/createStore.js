import { useEffect, useState } from "react"

// Creates a store implementation that is orthogonal to useState. The store is
// responsible for capturing the current state, managing subscriptions, and
// broadcasting state changes to subscribers.
//
// This implementation is inspired by @mucsi96’s react-create-shared-state.
//
// https://github.com/mucsi96/react-create-shared-state
export default function createStore(initialState) {
	const subscriptions = new Set()

	// currentState captures the current state the current state for new component
	// mounts; see useState(currentState).
	let currentState = initialState
	return () => {
		const [state, setState] = useState(currentState)

		// Effect for when a component mounts / unmounts.
		useEffect(() => {
			subscriptions.add(setState)
			return () => {
				subscriptions.delete(setState)
			}
		}, [])

		// Effect for state changes.
		useEffect(() => {
			currentState = state
			for (const setState of subscriptions) {
				setState(state)
			}
		}, [state])

		return [state, setState]
	}
}
