import { useLayoutEffect, useState } from "react"

// function noop() {}

// Creates a store implementation that is orthogonal to useState. The store is
// responsible for capturing the current state, managing subscribers, and
// broadcasting state changes to subscribers.
//
// This implementation is inspired by @mucsi96’s react-create-shared-state.
//
// https://github.com/mucsi96/react-create-shared-state
export default function createStore(initialState) {
	const subscribers = new Set()

	// cachedState captures the current state the current state for new component
	// mounts; see useState(cachedState).
	let cachedState = initialState
	return () => {
		const [state, setState] = useState(cachedState)

		// Effect for when a component mounts / unmounts.
		useLayoutEffect(() => {
			subscribers.add(setState)
			return () => {
				subscribers.delete(setState)
			}
		}, [])

		// Effect for state changes.
		useLayoutEffect(() => {
			cachedState = state
			for (const setState of subscribers) {
				setState(state)
			}
		}, [state])

		return [state, setState]
	}
}
