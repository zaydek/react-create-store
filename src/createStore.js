import { useCallback, useEffect, useState } from "react"

// This implementation is inspired by:
//
// - https://github.com/mucsi96/react-create-shared-state
// - https://github.com/pelotom/use-methods

const PRIVATE_STORE_KEY = {}

const errBadStore =
	"useStore: Bad store. " +
	"Use createStore(initialStateOrInitializer) to create a new store and then const [state, setState] = useStore(store)."

const errBadReducer =
	"useStore: Bad reducer. " +
	"Use const reducer = state => ({ increment() { return state + 1 } }) then const [state, funcs] = useStore(store, reducer)."

function freeze(value) {
	if (typeof value === "object") {
		Object.freeze(value)
	}
	return value
}

// Tests a store for store.__type__ === PRIVATE_STORE_KEY.
//
// prettier-ignore
function testStore(store) {
	const ok = (
		store &&
		store.__type__ &&
		store.__type__ === PRIVATE_STORE_KEY
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

// Creates a store.
export function createStore(initialStateOrInitializer) {
	const subscriptions = new Set()

	const initialState = freeze(
		typeof initialStateOrInitializer === "function" ? initialStateOrInitializer() : initialStateOrInitializer,
	)

	// Caches the current state for when a component mounts; see
	// useState(store.cachedState).
	let cachedState = freeze(initialState)

	return { __type__: PRIVATE_STORE_KEY, subscriptions, initialState, cachedState }
}

// Consumes a store; returns a state and setState accessor.
export function useStore(store, reducer = null) {
	// NOTE: Parameters store and reducer are expected to never change.
	useCallback(() => {
		if (!testStore(store)) {
			throw new Error(errBadStore)
		}
		if (reducer !== null && !testReducer(reducer)) {
			throw new Error(errBadReducer)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	let [state, setState] = useState(store.cachedState)
	state = freeze(state)

	// Manages subscriptions when a component mounts / unmounts.
	useEffect(() => {
		store.subscriptions.add(setState)
		return () => {
			store.subscriptions.delete(setState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const customSetState = useCallback(updater => {
		// NOTE: Reducer code freezes more than once because of freeze(state).
		const nextState = freeze(typeof updater === "function" ? updater(store.cachedState) : updater)
		store.cachedState = nextState
		setState(nextState)
		for (const set of store.subscriptions) {
			// Dedupe the current setState:
			if (set !== setState) {
				set(nextState)
			}
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// Does not use useMemo because state changes on every pass.
	let funcs
	if (reducer !== null) {
		const types = reducer(state)
		funcs = Object.keys(types).reduce((acc, type) => {
			acc[type] = (...args) => {
				const nextState = types[type](...args)
				customSetState(nextState)
			}
			return acc
		}, {})
	}

	// useReducer:
	if (funcs === undefined) {
		return [state, customSetState]
	}
	// useState:
	return [state, funcs]
}

// Consumes a store; returns a state accessor.
export function useStoreValue(store) {
	return useStore(store)[0]
}

// Consumes a store; returns a setState accessor.
export function useStoreSetState(store) {
	return useStore(store)[1]
}
