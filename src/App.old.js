import createStore from "./createStore"

const useStore = createStore("Hello, world!")

function AppRoot1() {
	const [state, setState] = useStore()
	return (
		<div>
			<h1>{state}</h1>
			<input type="text" value={state} onChange={e => setState(e.target.value)} />
			<pre>{JSON.stringify({ state }, null, 2)}</pre>
		</div>
	)
}

function AppRoot2() {
	const [state, setState] = useStore()
	return (
		<div>
			<h1>{state}</h1>
			<input type="text" value={state} onChange={e => setState(e.target.value)} />
			<pre>{JSON.stringify({ state }, null, 2)}</pre>
		</div>
	)
}

export default function AppRoot() {
	return (
		<div>
			<AppRoot1 />
			<AppRoot2 />
		</div>
	)
}
