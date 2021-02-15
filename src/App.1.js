import { createStore } from "./createStore"

// Creates a new four-character hash ID.
function newID() {
	return Math.random().toString(36).slice(2, 6)
}

const initialState = {
	done: false,
	text: "",
	todos: [
		// {
		//   id: "",
		//   done: false,
		//   text: "",
		// }
	],
}

const useTodos = createStore(initialState)

const reduce = (state, setState) => ({
	addTodo() {
		if (state.text === "") {
			// No-op
			return
		}
		const todo = { id: newID(), done: state.done, text: state.text }
		setState(s => ({ ...s, todos: [todo, ...s.todos] }))
		setState(s => ({ ...s, done: false, text: "" })) // Reset
	},
	setDone(done) {
		setState({ ...state, done })
	},
	setText(text) {
		setState({ ...state, text })
	},
	setDoneByID(id, done) {
		const todos = state.todos.map(each => {
			if (each.id === id) {
				return { ...each, done }
			}
			return each
		})
		setState({ ...state, todos })
	},
	setTextByID(id, text) {
		const todos = state.todos.map(each => {
			if (each.id === id) {
				return { ...each, text }
			}
			return each
		})
		setState({ ...state, todos })
	},
	removeByID(id) {
		const todos = state.todos.filter(each => each.id !== id)
		setState({ ...state, todos })
	},
})

function App() {
	const [state, setState] = useTodos()
	const funcs = reduce(state, setState)

	function handleSubmit(e) {
		e.preventDefault()
		funcs.addTodo()
	}

	return (
		<div>
			{/* eslint-disable-next-line no-sequences */}
			<form onSubmit={handleSubmit}>
				<input type="checkbox" checked={state.done} onChange={e => funcs.setDone(e.target.checked)} />
				<input type="text" value={state.text} onChange={e => funcs.setText(e.target.value)} />
				<button type="submit">+</button>
			</form>
			{state.todos.map(each => (
				<div key={each.id}>
					<input type="checkbox" checked={each.done} onChange={e => funcs.setDoneByID(each.id, e.target.checked)} />
					<input type="text" value={each.text} onChange={e => funcs.setTextByID(each.id, e.target.value)} />
					<button onClick={() => funcs.removeByID(each.id)}>-</button>
				</div>
			))}
		</div>
	)
}

function AppInfo() {
	const [state, setState] = useTodos()

	return (
		<>
			<pre>{JSON.stringify({ state }, null, 2)}</pre>
			<button onClick={e => setState(initialState)}>Reset back to the original state</button>
		</>
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
