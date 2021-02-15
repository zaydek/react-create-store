import { useCallback, useEffect, useMemo, useReducer, useState } from "react"

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

function freeze(value) {
	if (typeof value === "object") {
		Object.freeze(value)
	}
	return value
}

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

	const initialState = freeze(
		typeof initialStateOrInitializer === "function" ? initialStateOrInitializer() : initialStateOrInitializer,
	)

	// Caches the current state for when a component mounts; see
	// useState(store.cachedState).
	let cachedState = freeze(initialState)

	return { __type__: STORE_KEY, subscriptions, initialState, cachedState }
}

// // Uses a store; returns a state and setState accessor.
// export function useStore(store) {
// 	useCallback(() => {
// 		if (!testStore(store)) {
// 			throw new Error(errBadStore)
// 		}
// 	}, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	let [state, reactSetState] = useState(store.cachedState)
// 	state = freeze(state)
//
// 	// Manages subscriptions when a component mounts / unmounts.
// 	useEffect(() => {
// 		store.subscriptions.add(reactSetState)
// 		return () => {
// 			store.subscriptions.delete(reactSetState)
// 		}
// 	}, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	const setState = useCallback(updater => {
// 		const nextState = freeze(typeof updater === "function" ? updater(store.cachedState) : updater)
// 		store.cachedState = nextState
// 		reactSetState(nextState)
// 		for (const each of store.subscriptions) {
// 			// Dedupe the current setState:
// 			if (each !== reactSetState) {
// 				each(nextState)
// 			}
// 		}
// 	}, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	return [state, setState]
// }

// Uses a store; returns a state and setState accessor.
export function useStore(store, reducer = null) {
	// Guards. Parameters store and reducer are expected to never change.
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
		const nextState = freeze(typeof updater === "function" ? updater(store.cachedState) : updater)
		// if (!frozen) {
		// 	nextState = freeze(nextState)
		// }
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

// // Uses a store; returns a state and funcs accessor.
// export function useStoreReducer(store, reducer) {
// 	useCallback(() => {
// 		if (!testStore(store)) {
// 			throw new Error(errBadStore)
// 		}
// 	}, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	// const types = useMemo(() => {
// 	// 	return reducer(store.cachedState)
// 	// }, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	// // Create a React reducer from parameter reducer:
// 	// const reducerImpl = (state, action) => {
// 	// 	const reducerImpl = Object.keys(types).reduce((acc, type) => {
// 	// 		acc[type] = (...payload) => {
// 	// 			const nextState = types[type](...payload) // TODO: Add freeze(...).
// 	// 			store.cachedState = nextState // Update the cache // TODO: Run once.
// 	//
// 	// 			for (const each of store.subscriptions) {
// 	// 				// // Dedupe the current setState:
// 	// 				// if (each !== setState) {
// 	// 				each(nextState)
// 	// 				// }
// 	// 			}
// 	//
// 	// 			return nextState
// 	// 		}
// 	// 		return acc
// 	// 	}, {})
// 	// 	// Reduce:
// 	// 	return reducerImpl[action.type](...action.payload)
// 	// }
//
// 	const [, rerender] = useState(0)
//
// 	// Manages subscriptions when a component mounts / unmounts.
// 	useEffect(() => {
// 		store.subscriptions.add(rerender)
// 		return () => {
// 			store.subscriptions.delete(rerender)
// 		}
// 	}, []) // eslint-disable-line react-hooks/exhaustive-deps
//
// 	const [state, dispatch] = useReducer((state, action) => {
// 		const types = reducer(state)
// 		const reducerImpl = Object.keys(types).reduce((acc, type) => {
// 			acc[type] = (...payload) => {
// 				const nextState = types[type](...payload) // TODO: Add freeze(...).
// 				store.cachedState = nextState // Update the cache // TODO: Run once.
// 				for (const each of store.subscriptions) {
// 					// Dedupe the current setState:
// 					// if (rerender !== rerender_) {
// 					each(s => s + 1)
// 					// }
// 				}
// 				return nextState
// 			}
// 			return acc
// 		}, {})
// 		// Reduce:
// 		return reducerImpl[action.type](...action.payload)
// 	}, store.cachedState)
//
// 	// Convert dispatch to funcs:
// 	const types = reducer(state)
// 	const funcs = Object.keys(types).reduce((acc, type) => {
// 		acc[type] = (...payload) => {
// 			dispatch({ type, payload })
// 		}
// 		return acc
// 	}, {})
//
// 	return [state, funcs]
// }

// Uses a store; returns a state accessor.
export function useStoreValue(store) {
	return useStore(store)[0]
}

// Uses a store; returns a setState accessor.
export function useStoreSetState(store) {
	return useStore(store)[1]
}
