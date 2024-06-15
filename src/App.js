import './App.css';
import question from './question.json';
import Quiz from './components/Quiz';
function App() {
  console.log(question);
  return (
    <div className="App">
    <Quiz />
  </div>
  );
}

export default App;
