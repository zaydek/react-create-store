import * as types from "./types"
import { useEffect, useLayoutEffect, useState } from "react"

// createStore and createLazyStore are store implementations that broadcast
// state changes eagerly (useLayoutEffect) or lazily (useEffect). createStore
// and createLazyStore return a function that is orthogonal to useState.
//
// This implementation is inspired by react-create-shared-state.
// https://github.com/mucsi96/react-create-shared-state

// createStore creates an eager store. An eager store eagerly broadcasts state
// changes to subscriptions (useLayoutEffect).
export function createStore<T>(initialState: T): () => [T, types.SetState<T>] {
	const subscriptions = new Set<types.SetState<T>>()

	// cachedState captures the current state the current state for new component
	// mounts; see useState(cachedState).
	let cachedState = initialState
	return () => {
		const [state, setState] = useState(cachedState)

		// Effect for when a component mounts / unmounts.
		useLayoutEffect(() => {
			subscriptions.add(setState)
			return () => {
				subscriptions.delete(setState)
			}
		}, [])

		// Effect for state changes.
		useLayoutEffect(() => {
			cachedState = state
			for (const setState_ of subscriptions) {
				setState_(state)
			}
		}, [state])

		return [state, setState]
	}
}

// createStore creates a lazy store. A lazy store lazily broadcasts state
// changes to subscriptions (useEffect).
export function createLazyStore<T>(initialState: T): () => [T, types.SetState<T>] {
	const subscriptions = new Set<types.SetState<T>>()

	// cachedState captures the current state the current state for new component
	// mounts; see useState(cachedState).
	let cachedState = initialState
	return () => {
		const [state, setState] = useState(cachedState)

		// Effect for when a component mounts / unmounts.
		useEffect(() => {
			subscriptions.add(setState)
			return () => {
				subscriptions.delete(setState)
			}
		}, [])

		// Effect for state changes.
		useEffect(() => {
			cachedState = state
			for (const setState_ of subscriptions) {
				setState_(state)
			}
		}, [state])

		return [state, setState]
	}
}
