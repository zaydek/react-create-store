import { useCallback, useEffect, useState } from "react"

// This implementation is inspired by react-create-shared-state.
// https://github.com/mucsi96/react-create-shared-state

const internalStoreReference = {}

const badStoreError = new Error(
	"useStore: Bad store. " +
		"Use createStore(initialStateOrInitializer) to create a new store and then use const [state, setState] = useStore(store).",
)

// Tests a store for internalStoreReference.
function testStore(store) {
	return store && store.__type__ && store.__type__ === internalStoreReference
}

// Creates a new store.
export function createStore(initialStateOrInitializer) {
	const subscriptions = new Set()

	const initialState =
		typeof initialStateOrInitializer === "function" ? initialStateOrInitializer() : initialStateOrInitializer

	// Caches the current state for when a component mounts; see
	// useState(store.cachedState).
	let cachedState = initialState

	return { __type__: internalStoreReference, subscriptions, initialState, cachedState }
}

// Uses a store; returns a state and setState accessor.
export function useStore(store, reducer = null) {
	if (!testStore(store)) {
		throw badStoreError
	}

	// TODO: Add testReducer.

	const [state, setState] = useState(store.cachedState)

	// Effect that manages subscriptions when a component mounts / unmounts.
	useEffect(() => {
		store.subscriptions.add(setState)
		return () => {
			store.subscriptions.delete(setState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// Synthetic setState that broadcasts state changes to subscriptions.
	const syntheticSetState = useCallback(action => {
		const nextState = typeof action === "function" ? action(store.cachedState) : action
		store.cachedState = nextState
		setState(nextState)
		store.subscriptions.forEach(each => each(nextState))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	if (reducer !== null) {
		const reduce = reducer(state)
		const keys = Object.keys(reduce)
		const syntheticDispatch = keys.reduce((dispatch, action) => {
			dispatch[action] = function (/* Uses (...arguments) */) {
				syntheticSetState(reduce[action](...arguments))
			}
			return dispatch
		}, {})
		return [state, syntheticDispatch]
	}
	return [state, syntheticSetState]
}

// Uses a store; returns a state accessor.
export function useStoreValue(store) {
	return useStore(store)[0]
}

// Uses a store; returns a setState accessor.
export function useStoreSetState(store, reducer = null) {
	return useStore(store, reducer)[1]
}
