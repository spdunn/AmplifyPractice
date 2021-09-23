import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

import Amplify, { API, graphqlOperation } from 'aws-amplify';
import config from './aws-exports';
import { withAuthenticator, SignOut } from 'aws-amplify-react';
import { createGame } from './graphql/mutations.ts';

Amplify.configure(config);

function App() {
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState('');
  const [testArr, setTestArr] = useState([]);

  // GraphQL
  const [testGameName, setTestGameName] = useState('');
  const [testGameDesc, setTestGameDesc] = useState('');

  useEffect(() => {
    API.get('testapi', '/test/name')
      .then((resp) => {
        console.log(resp);
        setTestArr([...testArr, ...resp])
      });
      
    return () => {

    }
  }, [])

  const handleSubmit = e => {
    e.preventDefault()

    API.post('testapi', '/test', {
      body: {
        name: testName,
        type: testType
      }
    }).then(resp => {
      console.log(resp);
      // setTestArr([...testArr, {name: resp.name, type: resp.type}])
    });
  }

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
        <form onSubmit={handleSubmit}>
        <input value={testName} placeholder="Enter name here" onChange={(e) => setTestName(e.target.value)} />
        <input value={testType} placeholder="Enter type here" onChange={(e) => setTestType(e.target.value)} />
        <button>Add to DynamoDB</button>
        </form>
        <ul>
          {testArr.map(test => <li>{test.name}</li>)}
        </ul>
        <br></br>
        <br></br>
        <br></br>
        {/* <form onSubmit={handleSubmitGraphQL}> */}
        <input value={testGameName} placeholder="Enter name here" onChange={(e) => setTestGameName(e.target.value)} />
        <input value={testGameDesc} placeholder="Enter desc here" onChange={(e) => setTestGameDesc(e.target.value)} />
        <button onClick={handleSubmitGraphQL}>Add to DynamoDB with GraphQL</button>
        {/* </form> */}
        {/* <ul>
          {testArr.map(test => <li>{test.name}</li>)}
        </ul> */}
        <SignOut />
      </header>
    </div>
  );
}

export default withAuthenticator(App); 