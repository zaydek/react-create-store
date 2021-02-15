import { createStore, useStore } from "./createStore"

const store = createStore("Hello, world!")

function AppRoot1() {
	const [state, setState] = useStore(store)
	return <input type="text" value={state} onChange={e => setState(e.target.value)} />
}

const nums = [...Array(200).keys()]

export default function AppRoot() {
	return (
		<div>
			{nums.map(num => (
				<AppRoot1 key={num} />
			))}
		</div>
	)
}
