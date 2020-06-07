import React from 'react';
import logo from './logo.svg';
import './App.css';

import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { graphqlMutation } from 'aws-appsync-react';
import { buildSubscription } from 'aws-appsync';

const SubscribeToTodos = gql`
  subscription {
    onCreateTodo {
      id
      title
      completed
    }
  }
`;

const CreateTodo = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

const ListTodos = gql`
  query {
    listTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;

function App(props) {
  const [todo, setTodo] = React.useState('');

  React.useEffect(() => {
    props.subscribeToMore(buildSubscription(SubscribeToTodos, ListTodos));
  });

  const addTodo = () => {
    if (todo === '') {
      return;
    }
    const input = {
      title: todo,
      completed: false,
    };
    props.createTodo({ input });
    setTodo('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input onChange={(e) => setTodo(e.target.value)} value={todo} placeholder="Todo name" />
        <button onClick={addTodo}>Add Todo</button>
        {props.todos.map((todo) => (
          <p key={todo.id}>{todo.title}</p>
        ))}
      </header>
    </div>
  );
}

export default compose(
  graphqlMutation(CreateTodo, ListTodos, 'Todo'),
  graphql(ListTodos, {
    options: {
      fetchPolicy: 'cache-and-network',
    },
    props: (props) => ({
      subscribeToMore: props.data.subscribeToMore,
      todos: props.data.listTodos ? props.data.listTodos.items : [],
    }),
  })
)(App);
