import STORE_KEY from "./key"

export function freeze(value) {
	if (typeof value !== "object") {
		return value
	}
	return !Object.isFrozen(value) ? value : Object.freeze(value)
}

// export function testFrozen(value) {
// 	if (typeof value !== "object") {
// 		return true
// 	}
// 	return Object.isFrozen(value)
// }

// prettier-ignore
export function testStore(store) {
	const ok = (
		store &&
		store.__type__ &&
		store.__type__ === STORE_KEY
	)
	return ok
}

// prettier-ignore
export function testMethods(methods) {
	const ok = (
		typeof methods === "object" &&
		Object.keys(methods).length > 0 &&
		Object.keys(methods).every(key => typeof key  === "function")
	)
	return ok
}
