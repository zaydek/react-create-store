import createStore from "./createStore"

const useStore = createStore("Hello, world!")

function App() {
	const [state, setState] = useStore()
	return (
		<div>
			<h1>{state}</h1>
			<input type="text" value={state} onChange={e => setState(e.target.value)} />
		</div>
	)
}

function AppInfo() {
	const [state] = useStore()
	return (
		<div>
			<pre>{JSON.stringify({ state }, null, 2)}</pre>
		</div>
	)
}

export default function AppRoot() {
	return (
		<div>
			<App />
			<AppInfo />
		</div>
	)
}
