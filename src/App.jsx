import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useRef } from 'react';

import Amplify, { API, graphqlOperation } from 'aws-amplify';
import config from './aws-exports';
import { withAuthenticator, SignOut } from 'aws-amplify-react';
import { createGame } from './graphql/mutations.ts';
import { onCreateGame } from './graphql/subscriptions.ts';
import { listGames } from './graphql/queries';

Amplify.configure(config);

function App() {
  // GraphQL
  const [testGameName, setTestGameName] = useState('');
  const [testGameDesc, setTestGameDesc] = useState('');
  const [games, setGames] = useState([]);

  const gamesRef = useRef(games);

  useEffect(() => {

    API.graphql(graphqlOperation(listGames)).then(resp => {
      console.log(resp);
      gamesRef.current = [...resp.data.listGames.items];
      setGames([...resp.data.listGames.items]);
    })
      
    return () => {

    }
  }, [])

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateGame)
    ).subscribe({
        next: ({ provider, value }) => {
          console.log({ provider, value });
          console.log('games: ', games)
          setGames([...gamesRef.current, value.data.onCreateGame]);
        },
        error: error => console.warn(error)
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [])

  const handleSubmitGraphQL = async () => {
    console.log(testGameName, testGameDesc);
    if (testGameName === '' || testGameDesc === '') return;

    try {
      const game = {name: testGameName, description: testGameDesc};
      console.log(createGame)
      await API.graphql(graphqlOperation(createGame, {input: game}));
      console.log('Game successfully created', game)
    } catch (err) {
      console.log('Error creating game ', err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        Hello React
        <br></br>
        <br></br>
        <br></br>
        <input value={testGameName} placeholder="Enter name here" onChange={(e) => setTestGameName(e.target.value)} />
        <input value={testGameDesc} placeholder="Enter desc here" onChange={(e) => setTestGameDesc(e.target.value)} />
        <button onClick={handleSubmitGraphQL}>Add to DynamoDB with GraphQL</button>
        <ul>
          {games.map(temp => <li>{temp.name}</li>)}
        </ul>
      </header>
    </div>
  );
}

export default App; 
