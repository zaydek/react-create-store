export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

// prettier-ignore
export interface Todo {
	id:    string
	done:  boolean
	text:  string
}

// prettier-ignore
export interface TodoApp {
	done:  boolean
	text:  string
	todos: Todo[]
}
