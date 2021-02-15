import { useCallback, useEffect, useMemo, useState } from "react"

// This implementation is inspired by:
//
// - https://github.com/mucsi96/react-create-shared-state
// - https://github.com/pelotom/use-methods

const STORE_KEY = {}

const errBadStore =
	"useStore: Bad store. " +
	"Use createStore(initialStateOrInitializer) to create a new store and then const [state, setState] = useStore(store)."

const errBadReducer =
	"useStore: Bad reducer. " +
	"Use const reducer = state => ({ increment() { return state + 1 } }) then const [state, funcs] = useStore(store, reducer)."

// Tests a store for store.__type__ === STORE_KEY.
//
// prettier-ignore
function testStore(store) {
	const ok = (
		store &&
		store.__type__ &&
		store.__type__ === STORE_KEY
	)
	return ok
}

// Tests a reducer for the presence of func keys.
//
// prettier-ignore
function testReducer(reducer) {
	const ok = (
		typeof reducer === "object" &&
		Object.keys(reducer).length > 0 &&
		Object.keys(reducer).every(key => typeof key  === "function")
	)
	return ok
}

// Creates a new store.
export function createStore(initialStateOrInitializer) {
	const subscriptions = new Set()

	const initialState =
		typeof initialStateOrInitializer === "function" ? initialStateOrInitializer() : initialStateOrInitializer

	// Caches the current state for when a component mounts; see
	// useState(store.cachedState).
	let cachedState = initialState

	return { __type__: STORE_KEY, subscriptions, initialState, cachedState }
}

// Uses a store; returns a state and setState accessor.
export function useStore(store, reducer = null) {
	// Guard store and reducer. Parameters store and reducer cannot change.
	useCallback(() => {
		if (!testStore(store)) {
			throw new Error(errBadStore)
		}
		if (!testReducer(reducer)) {
			throw new Error(errBadReducer)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const [state, reactSetState] = useState(store.cachedState)

	// Manages subscriptions when a component mounts / unmounts.
	useEffect(() => {
		store.subscriptions.add(reactSetState)
		return () => {
			store.subscriptions.delete(reactSetState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const setState = useCallback(updater => {
		const nextState = typeof updater === "function" ? updater(store.cachedState) : updater
		store.cachedState = nextState
		reactSetState(nextState)
		for (const notify of store.subscriptions) {
			notify(nextState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const funcs = useMemo(() => {
		if (reducer === null) {
			return null
		}
		const methods = reducer(state)
		return Object.keys(methods).reduce((acc, key) => {
			acc[key] = function (/* Uses (...arguments) */) {
				setState(methods[key](...arguments))
			}
			return acc
		}, {})
	}, [state]) // eslint-disable-line react-hooks/exhaustive-deps

	if (reducer === null) {
		return [state, setState]
	}
	return [state, funcs]
}

// Uses a store; returns a state accessor.
export function useStoreValue(store) {
	return useStore(store)[0]
}

// Uses a store; returns a setState accessor.
export function useStoreSetState(store, reducer = null) {
	return useStore(store, reducer)[1]
}
